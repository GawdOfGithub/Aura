import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgComponent(props: any) {
  return (
    <Svg
      width={28}
      height={27}
      viewBox="0 0 28 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M11.993 1.263l-3.158 7.58m10.105 0l-3.158-7.58M1.263 8.842h25.263M20.21 1.263a2.526 2.526 0 012.021 1.011l3.79 5.053a2.526 2.526 0 01.016 3.008L15.945 24.212a2.526 2.526 0 01-4.102 0L1.751 10.335a2.526 2.526 0 01.017-3.008l3.787-5.05A2.526 2.526 0 017.58 1.264H20.21z"
        stroke="#fff"
        strokeWidth={2.52632}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
