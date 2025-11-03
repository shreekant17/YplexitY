import { Button } from "@nextui-org/react";

type HeartIconProps = {
  fill?: string;
  filled?: boolean;
  size?: number | string;
  height?: number | string;
  width?: number | string;
  [key: string]: any; // Allow additional props
};

export const HeartIcon = ({
  fill = "currentColor",
  filled = true,
  size = 28,
  height,
  width,
  strokeWidth = 1.5,
  ...props
}: HeartIconProps) => {
  return (
    <svg
      fill={filled ? fill : "none"}
      height={height || size}
      width={width || size}
      role="presentation"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};
