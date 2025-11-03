import { Button } from "@nextui-org/react";

type IconProps = {
  fill?: string;
  size?: number | string;
  height?: number | string;
  width?: number | string;
  [key: string]: any; // Allow additional props
};

export const UserIcon = ({
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
      <circle
        cx="12"
        cy="8"
        r="4"
        stroke={fill}
        strokeWidth={1.5}
        fill="none"
      />
      <path
        d="M4 20c0-4 4-7 8-7s8 3 8 7"
        stroke={fill}
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
