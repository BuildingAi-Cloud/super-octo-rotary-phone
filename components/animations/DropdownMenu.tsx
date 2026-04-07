import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function DropdownMenu({ children, open, ...props }: {
  children: ReactNode;
  open: boolean;
  [key: string]: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      style={{ pointerEvents: open ? 'auto' : 'none' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
