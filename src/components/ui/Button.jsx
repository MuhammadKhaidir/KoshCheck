import s from './Button.module.css'

/**
 * Tombol / tautan bergaya tombol.
 * as     : 'a' (default) | 'button'
 * variant: 'primary' | 'secondary' | 'marker' | 'ghostLight'
 * size   : 'md' | 'sm'
 */
export default function Button({
  as: Tag = 'a',
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) {
  const extra = Tag === 'button' ? { type: 'button' } : {}
  return (
    <Tag className={`${s.btn} ${s[variant]} ${s[size]} ${className}`} {...extra} {...rest}>
      {children}
    </Tag>
  )
}
