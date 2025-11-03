import { Button } from "@nextui-org/react";

// Define prop types for the icon component
type CommentsIconProps = {
  fill?: string; // default: "currentColor"
  filled?: boolean; // optional, used to toggle fill behavior
  size?: number | string; // can be number or string for width/height
  height?: number | string; // optional, overrides size if provided
  width?: number | string; // optional, overrides size if provided
};

export const CommentsIcon = ({
  fill = "currentColor",
  filled = true,
  size = 28,
  height,
  width,
  ...props
}: CommentsIconProps) => {
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
        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      />
    </svg>
  );
};
