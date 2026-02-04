import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgComponent(props: any) {
  return (
    <Svg
      width={29}
      height={29}
      viewBox="0 0 29 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M14.166 1.666c6.893 0 12.5 5.607 12.5 12.5s-5.605 12.5-12.5 12.5c-6.894 0-12.5-5.605-12.5-12.5 0-6.894 5.606-12.5 12.5-12.5z"
        stroke="#fff"
        strokeWidth={3.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.166 1.666c6.893 0 12.5 5.607 12.5 12.5s-5.605 12.5-12.5 12.5c-6.894 0-12.5-5.605-12.5-12.5 0-6.894 5.606-12.5 12.5-12.5z"
        stroke="#fff"
        strokeWidth={3.33333}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M17.864 11.385a.278.278 0 10.002.555.278.278 0 00-.002-.555M10.434 11.385a.278.278 0 10.002.555.278.278 0 00-.002-.555M18.056 17.146s-1.459 1.458-3.889 1.458c-2.43 0-3.889-1.458-3.889-1.458"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
