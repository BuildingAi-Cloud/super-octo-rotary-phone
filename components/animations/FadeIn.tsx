import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function FadeIn({ children, delay = 0, duration = 0.4, ...props }: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  [key: string]: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
