import { Button } from "@nextui-org/react";

type IconProps = {
  fill?: string;
  size?: number | string;
  height?: number | string;
  width?: number | string;
  [key: string]: any; // Allow additional props
};

export const ExitIcon = ({
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
        d="M15 3H9c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h6"
        stroke={fill}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 12h8M16 8l4 4-4 4"
        stroke={fill}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
