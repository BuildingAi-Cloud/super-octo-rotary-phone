import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function ButtonTap({ children, ...props }: { children: ReactNode; [key: string]: any }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 300 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
