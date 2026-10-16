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

/** CMS list building blocks: use for list pages, not editing forms. */
export const GoCmsNavItem: React.FC<{icon:React.ReactNode;children:React.ReactNode;active?:boolean;onClick:()=>void}> = ({icon,children,active,onClick}) => (
  <button type="button" aria-current={active?'page':undefined} onClick={onClick} className={`go-cms-nav ${active?'is-active':''}`}><span aria-hidden="true">{icon}</span><span>{children}</span></button>
);
export const GoCmsListHeader: React.FC<{icon:React.ReactNode;title:string;description:string;action:React.ReactNode}> = ({icon,title,description,action}) => (
  <GoSurface className="go-cms-list-header"><div><div className="go-cms-list-eyebrow">{icon}<span>活動管理</span></div><h2>{title}</h2><p>{description}</p></div><div className="go-cms-list-primary">{action}</div></GoSurface>
);
export const GoCmsListFilters: React.FC<{children:React.ReactNode}> = ({children}) => <GoSurface className="go-cms-list-filters">{children}</GoSurface>;
export const GoCmsTable: React.FC<{children:React.ReactNode}> = ({children}) => <GoSurface className="go-cms-table"><div className="overflow-x-auto"><table>{children}</table></div></GoSurface>;
export const GoCmsRowAction: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {tone?:'blue'|'green'|'purple'|'slate'}> = ({tone='blue',className='',...props}) => <button type="button" className={`go-cms-row-action go-cms-row-action--${tone} ${className}`} {...props}/>;
