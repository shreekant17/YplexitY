import { Button } from "@nextui-org/react";

type PlusIconProps = {
  fill?: string;
  size?: number | string;
  height?: number | string;
  width?: number | string;
  [key: string]: any; // Allow additional props
};

export const PlusIcon = ({
  fill = "currentColor",
  size = 24,
  height,
  width,
  ...props
}: PlusIconProps) => {
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
        d="M12 5v14M5 12h14"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};
