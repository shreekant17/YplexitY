import { Button } from "@nextui-org/react";

type IconProps = {
  fill?: string;
  size?: number | string;
  height?: number | string;
  width?: number | string;
  [key: string]: any; // Allow additional props
};
export const LoginIcon = ({
  fill = "currentColor",
  size = 24,
  height,
  width,
  ...props
}: IconProps) => {
  return (
    <svg
      fill={fill}
      height={height || size}
      width={width || size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9 3h6c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H9"
        stroke={fill}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 12H6m4-4l-4 4 4 4"
        stroke={fill}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
