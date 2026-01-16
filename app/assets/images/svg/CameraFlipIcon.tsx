import * as React from "react";
import Svg, { Defs, G, Path } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function SvgComponent(props: any) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G
        filter="url(#filter0_d_3790_791)"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M16.659 10.027a6.638 6.638 0 01-1.946 4.687 6.667 6.667 0 01-10.567-1.526M3.336 9.892a6.64 6.64 0 011.95-4.606 6.667 6.667 0 0110.566 1.526" />
        <Path d="M13.293 6.813h2.946V3.866M6.706 13.188H3.76v2.946" />
      </G>
      <Defs></Defs>
    </Svg>
  );
}

export default SvgComponent;
