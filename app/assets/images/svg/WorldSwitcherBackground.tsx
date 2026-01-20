import * as React from "react";
import Svg, { Defs, G, LinearGradient, Path, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function RectangleIcon(props:any) {
  return (
    <Svg
      width={142}
      height={61}
      viewBox="0 0 142 61"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G filter="url(#filter0_di_3808_764)" shapeRendering="crispEdges">
        <Path
          d="M4 27.121C4 12.227 17.367.894 32.06 3.331l6.171 1.023a200.296 200.296 0 0065.538 0l6.171-1.023C124.633.894 138 12.227 138 27.12c0 11.796-8.533 21.86-20.17 23.79l-8.563 1.42a233.9 233.9 0 01-76.534 0l-8.563-1.42C12.533 48.981 4 38.917 4 27.121z"
          fill="#fff"
          fillOpacity={0.12}
        />
        <Path
          d="M110.021 3.824C124.41 1.438 137.5 12.536 137.5 27.12c0 11.55-8.356 21.407-19.752 23.297l-8.563 1.42a233.4 233.4 0 01-76.37 0l-8.563-1.42C12.856 48.528 4.5 38.672 4.5 27.12c0-14.585 13.09-25.683 27.479-23.297l6.17 1.023a200.797 200.797 0 0065.702 0l6.17-1.023z"
          stroke="url(#paint0_linear_3808_764)"
          strokeOpacity={0.12}
        />
      </G>
      <Defs>
        <LinearGradient
          id="paint0_linear_3808_764"
          x1={71}
          y1={-1.32263}
          x2={71}
          y2={58.6774}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#fff" stopOpacity={0.04} />
          <Stop offset={1} stopColor="#fff" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
}

export default RectangleIcon;
