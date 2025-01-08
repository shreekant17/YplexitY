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
    size = 24,
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
                d="M12.62 20.81C12.28 20.93 11.72 20.93 11.38 20.81C8.48 19.82 2 15.69 2 8.68998C2 5.59998 4.49 3.09998 7.56 3.09998C9.38 3.09998 10.99 3.97998 12 5.33998C13.01 3.97998 14.63 3.09998 16.44 3.09998C19.51 3.09998 22 5.59998 22 8.68998C22 15.69 15.52 19.82 12.62 20.81Z"
                stroke={fill}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
            />
        </svg>
    );
};
