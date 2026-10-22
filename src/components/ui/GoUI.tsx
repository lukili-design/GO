import {X,ArrowLeft} from 'lucide-react';
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

/** Place at the right end of a modal header. */
export const GoModalClose: React.FC<{onClick:()=>void}> = ({onClick}) => (
 <button type="button" aria-label="關閉" title="關閉" onClick={onClick} className="inline-flex shrink-0 items-center justify-center w-9 h-9 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"><X size={20} aria-hidden="true"/></button>
);

/** CMS page navigation: fixed icon and copy, positioned at the top left. */
export const GoBackButton: React.FC<{onClick:()=>void;disabled?:boolean}> = ({onClick,disabled}) => (
 <GoButton variant="quiet" onClick={onClick} disabled={disabled}><ArrowLeft size={16} aria-hidden="true"/>返回</GoButton>
);

export const GoCmsFormSection: React.FC<{title:string;description?:string;children:React.ReactNode}> = ({title,description,children}) => (
  <GoSurface className="p-5 space-y-4"><div className="space-y-1"><h3>{title}</h3>{description&&<p className="text-xs text-slate-500">{description}</p>}</div>{children}</GoSurface>
);
export const GoCmsFormField: React.FC<{label:string;htmlFor:string;children:React.ReactNode}> = ({label,htmlFor,children}) => (
  <div className="space-y-2"><label className="block" htmlFor={htmlFor}>{label}</label>{children}</div>
);
