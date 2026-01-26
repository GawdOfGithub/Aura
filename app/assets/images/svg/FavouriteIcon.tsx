import * as React from "react";
import Svg, { Circle } from "react-native-svg";

function SvgComponent(props: any) {
  return (
    <Svg
      width={320}
      height={320}
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Circle
        cx={160}
        cy={160}
        r={158}
        // Using the specific RGBA color for the stroke
        stroke="rgba(255, 255, 255, 0.26)"
        strokeWidth={3}
        // 10px dash + 13.6px gap = ~23.6px unit length
        // 23.6px * 42 dashes ≈ 993px (Circumference)
        strokeDasharray="10 13.6"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default SvgComponent;
