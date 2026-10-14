import s from './Container.module.css'

export default function Container({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`${s.container} ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
