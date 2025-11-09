import { IoInformationCircleSharp } from "react-icons/io5";
import { useState } from "react";

interface TooltipProps {
    text: string;
    position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ text, position = "top" }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div className="tooltip-container">
            <IoInformationCircleSharp
                className="tooltip-icon"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            />
            {isVisible && (
                <div className={`tooltip-content tooltip-${position}`}>
                    {text}
                </div>
            )}
        </div>
    );
}