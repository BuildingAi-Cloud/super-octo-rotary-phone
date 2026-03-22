import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...props }) => (
  <button className={`btn btn-${variant}`} {...props}>
    {children}
  </button>
);
