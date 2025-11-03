import { Button } from "@nextui-org/react";

type ShareIconProps = {
  fill?: string;
  filled?: boolean;
  size?: number | string;
  height?: number | string;
  width?: number | string;
  [key: string]: any; // Allow additional props
};

export const ShareIcon = ({
  fill = "currentColor",
  filled = true,
  size = 24,
  height,
  width,
  ...props
}: ShareIconProps) => {
  return (
    <svg
      fill={filled ? fill : "none"}
      height={height || size}
      width={width || size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.012 3.012 0 000-1.41l7.13-4.08a2.995 2.995 0 10-.95-1.81L8 9.96a3.01 3.01 0 100 4.08l7.13 4.08c.5.59 1.18.96 1.95.96a3 3 0 100-6z"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};
