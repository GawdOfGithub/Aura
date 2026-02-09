import * as React from "react"
import Svg, { G, Path, Defs } from "react-native-svg"
/* SVGR has dropped some elements not supported by react-native-svg: filter */

function SvgComponent(props:any) {
  return (
    <Svg
      width={24}
      height={25}
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <G
        opacity={0.56}
        filter="url(#filter0_d_5549_51896)"
        stroke="#fff"
        strokeWidth={2.98125}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M6.429 20.36L9.215 3.643M14.786 20.36l2.786-16.717M21.211 7.888H4.252M19.752 16.118H2.792" />
      </G>
      <Defs></Defs>
    </Svg>
  )
}

export default SvgComponent