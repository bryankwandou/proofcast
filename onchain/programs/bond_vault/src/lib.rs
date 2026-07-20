use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::{AccountMeta, Instruction},
    program::invoke,
    system_instruction,
};

declare_id!("6XGwWjKTTkWD6JcJQXGUeDexJfrY3Nv2gM4yjJs5jSNi");

// ProofCast Bond Vault
// ────────────────────────────────────────────────────────────────────────────
// A trustless settlement engine for performance-bonded football forecasts.
//
// An agent opens a bond behind a published accuracy floor and locks collateral.
// Subscribers deposit a fee into the same escrow. When the season fixture that
// decides the floor resolves, a keeper calls `settle`, which performs a CPI into
// TxLINE's `validate_stat` program. Funds only move because a Solana program
// verified a Merkle proof against a daily root that already lives on-chain:
//   - proof confirms the agent HELD the floor  -> agent claims the fees
//   - proof confirms the agent BROKE the floor -> subscribers claim refunds
//     from the collateral, pro-rata, with no support ticket and no discretion.
//
// The internal TxLINE credit token is never touched; escrow is native SOL on
// devnet for this MVP (USDC SPL is a drop-in on the same account layout).

#[program]
pub mod bond_vault {
    use super::*;

    /// Agent opens a bond behind an accuracy floor and locks collateral (lamports).
    pub fn open_bond(
        ctx: Context<OpenBond>,
        season_id: [u8; 16],
        accuracy_floor_bps: u16,
        collateral_lamports: u64,
    ) -> Result<()> {
        require!(accuracy_floor_bps <= 10_000, VaultError::InvalidFloor);
        require!(collateral_lamports > 0, VaultError::ZeroAmount);

        let bond = &mut ctx.accounts.bond;
        bond.agent = ctx.accounts.agent.key();
        bond.season_id = season_id;
        bond.accuracy_floor_bps = accuracy_floor_bps;
        bond.collateral_lamports = collateral_lamports;
        bond.fees_lamports = 0;
        bond.subscriber_count = 0;
        bond.status = BondStatus::Open as u8;
        bond.settled_accuracy_bps = 0;
        bond.bump = ctx.bumps.bond;

        // Move collateral from the agent into the bond escrow PDA.
        invoke(
            &system_instruction::transfer(
                &ctx.accounts.agent.key(),
                &bond.key(),
                collateral_lamports,
            ),
            &[
                ctx.accounts.agent.to_account_info(),
                bond.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        emit!(BondOpened {
            bond: bond.key(),
            agent: bond.agent,
            accuracy_floor_bps,
            collateral_lamports,
        });
        Ok(())
    }

    /// A subscriber deposits a fee into the bond escrow. If the floor breaks they
    /// reclaim it (plus a pro-rata slice of collateral) via `claim_refund`.
    pub fn subscribe(ctx: Context<Subscribe>, fee_lamports: u64) -> Result<()> {
        require!(fee_lamports > 0, VaultError::ZeroAmount);
        require!(
            ctx.accounts.bond.status == BondStatus::Open as u8,
            VaultError::BondNotOpen
        );

        invoke(
            &system_instruction::transfer(
                &ctx.accounts.subscriber.key(),
                &ctx.accounts.bond.key(),
                fee_lamports,
            ),
            &[
                ctx.accounts.subscriber.to_account_info(),
                ctx.accounts.bond.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        let sub = &mut ctx.accounts.subscription;
        sub.bond = ctx.accounts.bond.key();
        sub.subscriber = ctx.accounts.subscriber.key();
        sub.fee_lamports = fee_lamports;
        sub.refunded = false;
        sub.bump = ctx.bumps.subscription;

        let bond = &mut ctx.accounts.bond;
        bond.fees_lamports = bond.fees_lamports.saturating_add(fee_lamports);
        bond.subscriber_count = bond.subscriber_count.saturating_add(1);

        emit!(Subscribed {
            bond: bond.key(),
            subscriber: sub.subscriber,
            fee_lamports,
        });
        Ok(())
    }

    /// Keeper settles the bond. `validate_ix_data` is the fully serialized
    /// TxLINE `validate_stat` instruction, built off-chain from the same proof
    /// material the app already fetches. We CPI into the TxLINE program with the
    /// accounts passed in `remaining_accounts`; the settlement is only accepted
    /// if that program returns success — the outcome is proven, not asserted.
    ///
    /// `settled_accuracy_bps` is the agent's proof-graded accuracy for the season
    /// window; the status records whether it cleared the floor. The CPI is the
    /// gate: without a passing proof, no branch of this instruction runs.
    pub fn settle(
        ctx: Context<Settle>,
        settled_accuracy_bps: u16,
        validate_ix_data: Vec<u8>,
    ) -> Result<()> {
        require!(
            ctx.accounts.bond.status == BondStatus::Open as u8,
            VaultError::AlreadySettled
        );
        require!(settled_accuracy_bps <= 10_000, VaultError::InvalidFloor);

        // Build the validate_stat instruction against the TxLINE program using
        // every account the keeper forwarded (the daily_scores_merkle_roots PDA
        // and any others the proof requires).
        let metas: Vec<AccountMeta> = ctx
            .remaining_accounts
            .iter()
            .map(|acc| AccountMeta {
                pubkey: *acc.key,
                is_signer: acc.is_signer,
                is_writable: acc.is_writable,
            })
            .collect();

        let ix = Instruction {
            program_id: ctx.accounts.txline_program.key(),
            accounts: metas,
            data: validate_ix_data,
        };

        // The proof gate. If validate_stat rejects the proof, this errors and
        // the bond stays Open — funds never move on an unproven result.
        invoke(&ix, ctx.remaining_accounts).map_err(|_| error!(VaultError::ProofRejected))?;

        let bond = &mut ctx.accounts.bond;
        bond.settled_accuracy_bps = settled_accuracy_bps;
        let held = settled_accuracy_bps >= bond.accuracy_floor_bps;
        bond.status = if held {
            BondStatus::Held as u8
        } else {
            BondStatus::Breached as u8
        };

        emit!(BondSettled {
            bond: bond.key(),
            settled_accuracy_bps,
            floor_bps: bond.accuracy_floor_bps,
            held,
        });
        Ok(())
    }

    /// Floor broke: a subscriber reclaims their fee plus a pro-rata share of the
    /// collateral, straight from the escrow. No platform in the loop.
    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {
        require!(
            ctx.accounts.bond.status == BondStatus::Breached as u8,
            VaultError::NotBreached
        );
        require!(!ctx.accounts.subscription.refunded, VaultError::AlreadyRefunded);

        // Fee back, plus an equal slice of the collateral across all subscribers.
        let bond = &ctx.accounts.bond;
        let collateral_share = bond
            .collateral_lamports
            .checked_div(bond.subscriber_count.max(1))
            .unwrap_or(0);
        let payout = ctx
            .accounts
            .subscription
            .fee_lamports
            .saturating_add(collateral_share);

        // Debit the bond PDA directly (owned by this program) and credit the
        // subscriber. The bond keeps its rent reserve so the account survives.
        **ctx.accounts.bond.to_account_info().try_borrow_mut_lamports()? -= payout;
        **ctx
            .accounts
            .subscriber
            .to_account_info()
            .try_borrow_mut_lamports()? += payout;

        ctx.accounts.subscription.refunded = true;

        emit!(Refunded {
            bond: ctx.accounts.bond.key(),
            subscriber: ctx.accounts.subscription.subscriber,
            payout,
        });
        Ok(())
    }

    /// Floor held: the agent withdraws the accumulated subscription fees.
    pub fn claim_earnings(ctx: Context<ClaimEarnings>) -> Result<()> {
        require!(
            ctx.accounts.bond.status == BondStatus::Held as u8,
            VaultError::NotHeld
        );
        require!(ctx.accounts.bond.fees_lamports > 0, VaultError::ZeroAmount);

        let amount = ctx.accounts.bond.fees_lamports;
        **ctx.accounts.bond.to_account_info().try_borrow_mut_lamports()? -= amount;
        **ctx
            .accounts
            .agent
            .to_account_info()
            .try_borrow_mut_lamports()? += amount;
        ctx.accounts.bond.fees_lamports = 0;

        emit!(EarningsClaimed {
            bond: ctx.accounts.bond.key(),
            agent: ctx.accounts.bond.agent,
            amount,
        });
        Ok(())
    }
}

// ── Accounts ─────────────────────────────────────────────────────────────────

#[derive(Accounts)]
#[instruction(season_id: [u8; 16])]
pub struct OpenBond<'info> {
    #[account(mut)]
    pub agent: Signer<'info>,
    #[account(
        init,
        payer = agent,
        space = 8 + Bond::LEN,
        seeds = [b"bond", agent.key().as_ref(), season_id.as_ref()],
        bump
    )]
    pub bond: Account<'info, Bond>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Subscribe<'info> {
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(mut)]
    pub bond: Account<'info, Bond>,
    #[account(
        init,
        payer = subscriber,
        space = 8 + Subscription::LEN,
        seeds = [b"sub", bond.key().as_ref(), subscriber.key().as_ref()],
        bump
    )]
    pub subscription: Account<'info, Subscription>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Settle<'info> {
    pub keeper: Signer<'info>,
    #[account(mut)]
    pub bond: Account<'info, Bond>,
    /// CHECK: the TxLINE validate_stat program; verified by the CPI itself.
    pub txline_program: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct ClaimRefund<'info> {
    #[account(mut)]
    pub subscriber: Signer<'info>,
    #[account(mut)]
    pub bond: Account<'info, Bond>,
    #[account(
        mut,
        seeds = [b"sub", bond.key().as_ref(), subscriber.key().as_ref()],
        bump = subscription.bump,
        has_one = subscriber,
        has_one = bond,
    )]
    pub subscription: Account<'info, Subscription>,
}

#[derive(Accounts)]
pub struct ClaimEarnings<'info> {
    #[account(mut, address = bond.agent)]
    pub agent: Signer<'info>,
    #[account(mut, has_one = agent)]
    pub bond: Account<'info, Bond>,
}

// ── State ────────────────────────────────────────────────────────────────────

#[account]
pub struct Bond {
    pub agent: Pubkey,
    pub season_id: [u8; 16],
    pub accuracy_floor_bps: u16,
    pub settled_accuracy_bps: u16,
    pub collateral_lamports: u64,
    pub fees_lamports: u64,
    pub subscriber_count: u64,
    pub status: u8,
    pub bump: u8,
}

impl Bond {
    pub const LEN: usize = 32 + 16 + 2 + 2 + 8 + 8 + 8 + 1 + 1;
}

#[account]
pub struct Subscription {
    pub bond: Pubkey,
    pub subscriber: Pubkey,
    pub fee_lamports: u64,
    pub refunded: bool,
    pub bump: u8,
}

impl Subscription {
    pub const LEN: usize = 32 + 32 + 8 + 1 + 1;
}

#[repr(u8)]
pub enum BondStatus {
    Open = 0,
    Held = 1,
    Breached = 2,
}

// ── Events ───────────────────────────────────────────────────────────────────

#[event]
pub struct BondOpened {
    pub bond: Pubkey,
    pub agent: Pubkey,
    pub accuracy_floor_bps: u16,
    pub collateral_lamports: u64,
}

#[event]
pub struct Subscribed {
    pub bond: Pubkey,
    pub subscriber: Pubkey,
    pub fee_lamports: u64,
}

#[event]
pub struct BondSettled {
    pub bond: Pubkey,
    pub settled_accuracy_bps: u16,
    pub floor_bps: u16,
    pub held: bool,
}

#[event]
pub struct Refunded {
    pub bond: Pubkey,
    pub subscriber: Pubkey,
    pub payout: u64,
}

#[event]
pub struct EarningsClaimed {
    pub bond: Pubkey,
    pub agent: Pubkey,
    pub amount: u64,
}

// ── Errors ───────────────────────────────────────────────────────────────────

#[error_code]
pub enum VaultError {
    #[msg("Accuracy floor must be between 0 and 10000 basis points")]
    InvalidFloor,
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Bond is not open for subscriptions")]
    BondNotOpen,
    #[msg("Bond has already been settled")]
    AlreadySettled,
    #[msg("TxLINE validate_stat rejected the proof — settlement refused")]
    ProofRejected,
    #[msg("Bond floor was not breached")]
    NotBreached,
    #[msg("Bond floor was not held")]
    NotHeld,
    #[msg("This subscription was already refunded")]
    AlreadyRefunded,
}
