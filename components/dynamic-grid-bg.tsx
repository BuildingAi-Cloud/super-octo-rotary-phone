"use client"

import { useEffect, useState } from "react"

type DynamicGridBgProps = {
  opacity?: number
  speed?: number
  className?: string
}

/**
 * Animated grid background that shifts position on scroll.
 * Creates a parallax effect where the grid pattern moves subtly as the page scrolls,
 * keeping the background visually engaging and alive.
 * @param opacity - Background opacity (0-1), default 0.2
 * @param speed - Scroll multiplier for parallax effect (0-1), default 0.5
 * @param className - Additional CSS classes
 */
export function DynamicGridBg({ opacity = 0.2, speed = 0.5, className }: DynamicGridBgProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      // Calculate parallax offset: multiply scroll position by speed to create subtle movement.
      const scrollY = window.scrollY || window.pageYOffset
      setOffset(scrollY * speed)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [speed])

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 ${className || ""}`}
      style={{
        // Transform shifts the grid position as user scrolls, creating a parallax animation.
        transform: `translateY(${offset}px)`,
        opacity,
        transition: "transform 0.1s ease-out",
      }}
      aria-hidden="true"
    >
      {/* Container with the grid pattern that will translate on scroll. */}
      <div className="grid-bg absolute inset-0 w-full h-[200%]" />
    </div>
  )
}
