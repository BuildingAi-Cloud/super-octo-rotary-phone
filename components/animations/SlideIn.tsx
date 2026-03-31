import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function SlideIn({ children, direction = 'up', delay = 0, duration = 0.4, ...props }: {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  [key: string]: any;
}) {
  const variants = {
    up:   { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: 20, opacity: 0 },
    right:{ x: -20, opacity: 0 },
  };
  return (
    <motion.div
      initial={variants[direction]}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ delay, duration }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
