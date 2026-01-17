import React from 'react'
import styles from './Button.module.css'

function Button({ children, onClick, variant = 'primary', className: externalClassName = '' }) {
  const className = `${styles.button} ${styles[variant] || styles.primary} ${externalClassName}`
  
  return (
    <button className={className} onClick={onClick}>
      {children}
    </button>
  )
}

export default Button
