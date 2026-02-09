import * as React from "react"
import Svg, { Path } from "react-native-svg"

function SvgComponent(props:any) {
  return (
    <Svg
      width={29}
      height={27}
      viewBox="0 0 29 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M6.835 24.277l3.715-22.29M17.979 24.277l3.714-22.29M26.546 7.648H3.934M24.6 18.62H1.987"
        stroke="#fff"
        strokeWidth={3.975}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export default SvgComponent