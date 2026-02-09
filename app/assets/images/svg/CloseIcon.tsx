import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgComponent(props: any) {
  return (
    <Svg
      width={19}
      height={19}
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <Path
        d="M1.994 16.096L16.096 1.994m-14.102 0l14.102 14.102"
        stroke={props.stroke || "#fff"}
        strokeOpacity={props.strokeOpacity || 0.9}
        strokeWidth={props.strokeWidth || 3.98864}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;