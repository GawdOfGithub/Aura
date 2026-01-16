import * as React from "react";
import Svg, { G, Path, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function ThunderIcon(props: any) {
  return (
    <Svg
      width={20}
      height={21}
      viewBox="0 0 20 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G filter="url(#filter0_d_3835_813)">
        <Path
          clipRule="evenodd"
          d="M10.806 2.5L3.96 11.667h6.042L9.195 17.5l6.847-9.167h-6.041l.806-5.833z"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          shapeRendering="crispEdges"
        />
      </G>
      <Defs></Defs>
    </Svg>
  );
}

export default ThunderIcon;
