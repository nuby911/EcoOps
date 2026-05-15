import React from 'react';
import clsx from 'clsx';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function BentoCard({ children, className, interactive, ...props }: BentoCardProps) {
  return (
    <div 
      className={clsx(
        'bento-card relative overflow-hidden',
        interactive && 'interactive cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
