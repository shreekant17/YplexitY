// Define prop types for the icon component
type ThreeDotsProps = {
  fill?: string; // default: "currentColor"
  filled?: boolean; // optional, used to toggle fill behavior
  size?: number | string; // can be number or string for width/height
  height?: number | string; // optional, overrides size if provided
  width?: number | string; // optional, overrides size if provided
};

export const ThreeDots = ({
  fill = "currentColor",
  filled = true,
  size = 28,
  height,
  width,
  ...props
}: ThreeDotsProps) => {
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
        fillRule="evenodd"
        d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
};
