import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgComponent(props: any) {
  return (
    <Svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        clipRule="evenodd"
        d="M8.872 33.13L32.92 21.965c1.663-.772 1.663-3.162 0-3.933L8.872 6.87c-1.725-.8-3.55.897-2.905 2.702l3.721 10.423L5.967 30.43c-.645 1.803 1.18 3.5 2.905 2.7z"
        stroke="#323232"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.683 20h24.483"
        stroke="#323232"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
