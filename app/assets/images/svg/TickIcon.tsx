import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props:any) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M16 5.2L7.2 14l-4-4"
        stroke="#fff"
        strokeWidth={3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SvgComponent