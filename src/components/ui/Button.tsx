import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg";

const variants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_10px_rgba(37,99,235,0.2)] border border-blue-600 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]",
  secondary: "bg-light-700 dark:bg-dark-700 text-gray-900 dark:text-gray-100 hover:bg-light-600 dark:hover:bg-dark-600",
  ghost: "bg-transparent text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400"
};

const sizes = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-2.5"
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  to, 
  onClick,
  className = "",
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const buttonStyles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  } ${className}`;

  if (to && !disabled) {
    return (
      <Link to={to} className={buttonStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button 
      onClick={onClick} 
      className={buttonStyles}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
} 