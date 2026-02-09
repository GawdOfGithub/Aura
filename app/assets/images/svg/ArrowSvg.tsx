import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props:any) {
  return (
    <Svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M18.666 10.667L13.333 16l5.333 5.333"
        stroke="#fff"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SvgComponent