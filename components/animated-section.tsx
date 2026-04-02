"use client"

import { motion, MotionProps } from "framer-motion"
import { ReactNode } from "react"

type AnimatedSectionProps = {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right"
  className?: string
} & MotionProps

/**
 * Reusable animated section wrapper for smooth entrance animations.
 * Perfect for staggering content on scroll with Framer Motion.
 */
export function AnimatedSection({
  children,
  delay = 0,
  duration = 0.6,
  direction = "up",
  className = "",
  ...motionProps
}: AnimatedSectionProps) {
  const directions = {
    up: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } },
    down: { initial: { opacity: 0, y: -30 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 } },
    right: { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 } },
  }

  const directionVariant = directions[direction]

  return (
    <motion.div
      className={className}
      initial={directionVariant.initial}
      whileInView={directionVariant.animate}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}
