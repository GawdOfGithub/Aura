import * as React from "react"
import Svg, { Rect, Path } from "react-native-svg"

function SvgComponent(props:any) {
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Rect
        x={3.5}
        y={9.3335}
        width={15.1667}
        height={15.1667}
        rx={3.5}
        stroke="#fff"
        strokeWidth={2.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.334 9.333V7a3.5 3.5 0 013.5-3.5H21A3.5 3.5 0 0124.5 7v8.167a3.5 3.5 0 01-3.5 3.5h-2.333"
        stroke="#fff"
        strokeWidth={2.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.021 12.834a.146.146 0 110 .291.146.146 0 010-.291M11.084 16.771a.146.146 0 11-.001.292.146.146 0 010-.292M7.146 20.709a.146.146 0 110 .291.146.146 0 010-.291M14.875 20.854a.146.146 0 11.292 0 .146.146 0 01-.292 0M7.145 12.834a.146.146 0 10.001.291.146.146 0 000-.291M20.854 7.292a.146.146 0 110-.292.146.146 0 010 .292"
        stroke="#fff"
        strokeWidth={2.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SvgComponent