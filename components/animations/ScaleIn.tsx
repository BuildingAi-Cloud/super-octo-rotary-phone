import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

type ScaleInProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
} & HTMLMotionProps<"div">;

export function ScaleIn({ children, delay = 0, duration = 0.4, ...props }: ScaleInProps) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
