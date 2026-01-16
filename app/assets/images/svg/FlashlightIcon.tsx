import * as React from "react";
import Svg, { Path } from "react-native-svg";

function SvgComponent(props: any) {
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
        clipRule="evenodd"
        d="M8.706 7.916L3.062 13.56a1.918 1.918 0 000 2.71l.677.676c.749.748 1.961.748 2.71 0l5.644-5.644a1.917 1.917 0 011.084-.542l1.106-.157c.41-.059.79-.249 1.084-.542l1.584-1.584a1.917 1.917 0 000-2.709l-2.71-2.71a1.918 1.918 0 00-2.708 0L9.949 4.644a1.917 1.917 0 00-.542 1.084l-.159 1.11c-.06.408-.25.787-.542 1.079z"
        stroke="#2E2E2E"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9.17 10.838l1.25-1.25"
        stroke="#2E2E2E"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M15.592 9.835l-5.418-5.418"
        stroke="#2E2E2E"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default SvgComponent;
