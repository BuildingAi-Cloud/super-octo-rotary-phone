import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function ScaleIn({ children, delay = 0, duration = 0.4, ...props }: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  [key: string]: any;
}) {
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
