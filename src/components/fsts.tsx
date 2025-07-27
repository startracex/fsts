"use client";

import { useEffect, useRef } from "react";
import { useState, useCallback } from "react";

export default function Component() {
  const [expandedSide, setExpandedSide] = useState<"none" | "light" | "dark">("none");
  const [mouseSide, setMouseSide] = useState<"none" | "light" | "dark">("none");

  const rootRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const setTooltipPosition = useCallback((x: number, y: number) => {
    if (!tooltipRef.current || !rootRef.current) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();
    const rootRect = rootRef.current.getBoundingClientRect();

    let left = x - rect.width / 2;
    let top = y - rect.height;

    if (left < 0) {
      left = 0;
    }
    if (left + rect.width > rootRect.width) {
      left = rootRect.width - rect.width;
    }
    if (top < 0) {
      top = 0;
    }
    if (top + rect.height > rootRect.height) {
      top = rootRect.height - rect.height;
    }

    console.log({ left, top });

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      setMousePos({ x, y });
    };

    addEventListener("mousemove", handleMouseMove);
    return () => removeEventListener("mousemove", handleMouseMove);
  }, [setTooltipPosition]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setTooltipPosition(mousePos.x, mousePos.y);
    });
  }, [expandedSide, mouseSide, mousePos, setTooltipPosition]);

  const handleClick = useCallback((side: "light" | "dark") => {
    setExpandedSide((prev) => (prev === "none" ? side : prev === side ? "none" : side));
  }, []);

  const whiteWidthClass = expandedSide === "light" ? "w-full" : expandedSide === "dark" ? "w-0" : "w-1/2";
  const blackWidthClass = expandedSide === "dark" ? "w-full" : expandedSide === "light" ? "w-0" : "w-1/2";

  const tooltipText =
    expandedSide === "none"
      ? mouseSide === "light"
        ? "Switch to light theme"
        : "Switch to dark theme"
      : "Switch to split view";

  return (
    <div
      ref={rootRef}
      className="relative h-full w-full overflow-hidden scroll-smooth"
    >
      <div
        className="relative h-screen flex items-center justify-center"
        onMouseEnter={() => tooltipRef.current?.showPopover()}
        onMouseLeave={() => tooltipRef.current?.hidePopover()}
      >
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-500 ease-in-out ${whiteWidthClass} bg-white`}
          style={{
            backgroundClip: "content-box",
            backgroundImage: "radial-gradient(#3c3c3c 1px, transparent 1px)",
            backgroundSize: "70px 70px",
            backgroundPosition: "0.5px 0.5px",
          }}
          onClick={() => handleClick("light")}
          onMouseEnter={() => setMouseSide("light")}
          onMouseLeave={() => setMouseSide("none")}
        />
        <div
          className={`absolute inset-y-0 right-0 transition-all duration-500 ease-in-out ${blackWidthClass} bg-black`}
          style={{
            backgroundClip: "content-box",
            backgroundImage:
              "linear-gradient(to right, #242424 1px, transparent 1px), linear-gradient(to bottom, #242424 1px, transparent 1px)",
            backgroundSize: "70px 70px",
            backgroundPosition: "35px 35px",
          }}
          onClick={() => handleClick("dark")}
          onMouseEnter={() => setMouseSide("dark")}
          onMouseLeave={() => setMouseSide("none")}
        />

        <h1 className="relative w-full z-10 text-6xl md:text-8xl font-extrabold select-none mix-blend-difference text-white pointer-events-none">
          <span className="absolute right-1/2 translate-y-[-50%] px-3">Switch</span>
          <span className="absolute left-1/2 translate-y-[-50%] px-3">Theme</span>
        </h1>
      </div>

      <div
        ref={tooltipRef}
        popover="manual"
        className="pointer-events-none mix-blend-difference bg-transparent"
      >
        <div className="px-3 py-1.5 rounded-md whitespace-nowrap bg-white text-black">{tooltipText}</div>
      </div>
    </div>
  );
}
