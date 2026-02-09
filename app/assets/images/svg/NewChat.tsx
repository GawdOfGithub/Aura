import * as React from "react"
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function SvgComponent(props:any) {
  return (
    <Svg
      width={36}
      height={36}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G
        clipPath="url(#clip0_5549_51616)"
        filter="url(#filter0_d_5549_51616)"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path
          d="M4.566 25.337c0-2.934 2.4-5.334 5.333-5.334h5.334c2.933 0 5.333 2.4 5.333 5.334M15.9 8.004c1.866 1.866 1.866 4.8 0 6.533-1.867 1.733-4.8 1.867-6.534 0C7.633 12.67 7.5 9.87 9.233 8.004c1.733-1.867 4.8-1.734 6.666 0"
          strokeWidth={3.86667}
        />
        <Path
          d="M23.232 18.67h4c2.267 0 4 1.733 4 4M27.633 8.937c1.333 1.333 1.333 3.466 0 4.667-1.334 1.2-3.467 1.333-4.667 0-1.2-1.334-1.334-3.467 0-4.667 1.2-1.2 3.333-1.2 4.666 0"
          strokeWidth={2.66667}
        />
      </G>
      <Defs>
        <ClipPath id="clip0_5549_51616">
          <Path fill="#fff" transform="translate(1.896)" d="M0 0H32V32H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}

export default SvgComponent;