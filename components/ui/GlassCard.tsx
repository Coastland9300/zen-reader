import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white/70 dark:bg-zinc-900/60 
        backdrop-blur-xl 
        border border-white/40 dark:border-white/10 
        shadow-lg shadow-zinc-200/50 dark:shadow-black/50
        rounded-2xl 
        transition-all duration-300 ease-out
        ${className}
      `}
    >
      {children}
    </div>
  );
};
