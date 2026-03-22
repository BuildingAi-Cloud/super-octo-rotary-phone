import React from 'react';

export interface CardProps {
  title: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children }) => (
  <div className="card">
    <h3>{title}</h3>
    <div>{children}</div>
  </div>
);
