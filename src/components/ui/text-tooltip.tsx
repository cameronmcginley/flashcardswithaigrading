import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface TextTooltipProps {
  text: string;
  className?: string;
  maxWidth?: string;
  tooltipClassName?: string;
  children?: React.ReactNode;
  showOnlyIfTruncated?: boolean;
}

export function TextTooltip({
  text,
  className,
  maxWidth = "100%",
  tooltipClassName,
  children,
  showOnlyIfTruncated = true,
}: TextTooltipProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const textRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Check if the component is mounted (for SSR compatibility)
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Check if text is truncated
  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        setIsTruncated(
          textRef.current.scrollWidth > textRef.current.clientWidth
        );
      }
    };

    checkTruncation();

    // Add resize listener
    window.addEventListener("resize", checkTruncation);

    return () => {
      window.removeEventListener("resize", checkTruncation);
    };
  }, [text]);

  const handleMouseEnter = () => {
    setIsHovering(true);
    updateTooltipPosition();
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const updateTooltipPosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top - 10, // Position above the element with a small gap
        left: rect.left + rect.width / 2, // Center horizontally
      });
    }
  };

  const shouldShowTooltip = showOnlyIfTruncated
    ? isTruncated && isHovering
    : isHovering;

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-block", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ maxWidth }}
    >
      <div ref={textRef} className="truncate">
        {children || text}
      </div>

      {isMounted &&
        shouldShowTooltip &&
        createPortal(
          <div
            className={cn(
              "fixed z-[999] bg-popover text-popover-foreground px-3 py-1.5 text-sm rounded-md shadow-md border whitespace-nowrap max-w-[250px]",
              tooltipClassName
            )}
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: "translate(-50%, -100%)",
            }}
          >
            {text}
          </div>,
          document.body
        )}
    </div>
  );
}
