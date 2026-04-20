import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0b0b0b",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 80,
          color: "white",
          opacity,
          fontFamily: "sans-serif",
        }}
      >
        Hello from Remotion!
      </div>
    </AbsoluteFill>
  );
};
