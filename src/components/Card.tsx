import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md'
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const hoverStyle = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${paddingStyles[padding]} ${hoverStyle} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
