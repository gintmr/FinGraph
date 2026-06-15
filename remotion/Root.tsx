import { Composition, Folder } from "remotion";
import { OpeningTransition } from "./OpeningTransition";

export const RemotionRoot = () => {
  return (
    <Folder name="FinGraph">
      <Composition
        id="FinGraphOpeningTransition"
        component={OpeningTransition}
        durationInFrames={3060}
        fps={30}
        width={1920}
        height={1080}
      />
    </Folder>
  );
};
