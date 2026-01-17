import React from 'react'
import styles from './AdminTabs.module.css'

function AdminTabs({ activeTab, onTabChange }) {
  return (
    <div className={styles.tabs}>
      <button 
        className={`${styles.tab} ${activeTab === 'items' ? styles.activeTab : ''}`}
        onClick={() => onTabChange('items')}
      >
        Предметы
      </button>
      <button 
        className={`${styles.tab} ${activeTab === 'statistics' ? styles.activeTab : ''}`}
        onClick={() => onTabChange('statistics')}
      >
        Статистика
      </button>
    </div>
  )
}

export default AdminTabs
