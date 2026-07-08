import React from "react";
import { Composition } from "remotion";
import { ProofCastVideo, MASTER_DURATION } from "./ProofCast";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Master"
        component={ProofCastVideo}
        durationInFrames={MASTER_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
