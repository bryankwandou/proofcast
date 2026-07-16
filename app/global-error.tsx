"use client";

// Explicit top-level error boundary. Beyond being good practice, defining it
// makes Next emit a complete _global-error route segment, which the prebuilt
// deploy path needs in order to upload cleanly.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#070a08",
          color: "#f2f5f2",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <p style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, letterSpacing: 2, color: "#93a29b" }}>
          FULL TIME
        </p>
        <h1 style={{ fontSize: 28, margin: 0 }}>Something went off the pitch.</h1>
        <p style={{ color: "#93a29b", maxWidth: 420, textAlign: "center" }}>
          An unexpected error interrupted the match. Reload to get back on.
          {error?.digest ? ` (ref ${error.digest})` : ""}
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: 8,
            borderRadius: 999,
            border: "none",
            padding: "10px 24px",
            background: "#52f2a5",
            color: "#04140d",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Restart
        </button>
      </body>
    </html>
  );
}
