import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgComponent(props: any) {
  return (
    <Svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M13.598 21h-3.2"
        stroke="#fff"
        strokeOpacity={0.9}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        clipRule="evenodd"
        d="M17 10.032V10v0a5 5 0 00-5-5v0a5 5 0 00-5 5v2.504a.855.855 0 01-.472.764l-.503.251A1.857 1.857 0 005 15.178v0c0 1.024.83 1.854 1.854 1.854h10.292c1.024 0 1.854-.83 1.854-1.854v0c0-.702-.397-1.344-1.025-1.658l-.503-.251a.857.857 0 01-.472-.765v-2.472z"
        stroke="#fff"
        strokeOpacity={0.9}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
