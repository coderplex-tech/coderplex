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
  primary: "bg-primary-dark hover:bg-primary-dark/90 text-white shadow-sm hover:shadow",
  secondary: "bg-light-700 dark:bg-dark-700 text-gray-900 dark:text-gray-100 hover:bg-light-600 dark:hover:bg-dark-600",
  ghost: "text-gray-700 dark:text-gray-200 hover:bg-light-700 dark:hover:bg-dark-700"
};

const sizes = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-6 py-3"
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