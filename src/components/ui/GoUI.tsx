import React from 'react';

export const formControlClass = 'go-control';
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'quiet'; };
export const GoButton: React.FC<ButtonProps> = ({ variant = 'primary', className = '', type = 'button', ...props }) => (
  <button type={type} className={`go-button go-button--${variant} ${className}`} {...props}/>
);
export const GoSurface: React.FC<React.HTMLAttributes<HTMLElement>> = ({ className = '', ...props }) => (
  <section className={`go-surface ${className}`} {...props}/>
);
export const GoBanner: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className = '', alt = '', ...props }) => (
  <img className={`go-banner ${className}`} alt={alt} {...props}/>
);
export const GoNotice: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p role="alert" className="go-notice">{children}</p>
);
