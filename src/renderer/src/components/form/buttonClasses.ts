export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export const buttonVariantClass: Record<ButtonVariant, string> = {
    primary: 'border-transparent bg-accent text-light-50 hover:bg-light-600 hover:drop-shadow-accent disabled:hover:bg-accent disabled:hover:text-light-50',
    danger: 'border-light-950/10 bg-transparent text-error hover:border-transparent hover:bg-error hover:text-light-50 disabled:hover:border-light-950/10 disabled:hover:bg-transparent disabled:hover:text-error',
    secondary: 'border-light-950/10 bg-light-50 text-light-950/65 hover:border-transparent hover:bg-accent hover:text-light-50 disabled:hover:border-light-950/10 disabled:hover:bg-transparent disabled:hover:text-light-950/65'
};
