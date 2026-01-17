import React from 'react'
import styles from './AdminItemsList.module.css'

function AdminItemsList({ items, statistics, loading, listError, getItemStats, onEdit, onDelete, onToggleEnabled }) {
  return (
    <section className={styles.listSection}>
      <div className={styles.sectionHeader}>
        <h2>Все предметы</h2>
        <span>{items.length}</span>
      </div>

      {loading && <p className={styles.status}>Загружаем...</p>}
      {!loading && listError && <p className={styles.error}>{listError}</p>}

      {!loading && !listError && (
        <ul className={styles.list}>
          {items.map((item) => {
            const stats = getItemStats(item.id);
            return (
              <li key={item.id} className={styles.listItem}>
                <div>
                  <div className={styles.itemHeader}>
                    <p className={styles.listItemTitle}>{item.name || 'Без названия'}</p>
                    {!item.enabled && <span className={styles.disabledBadge}>Отключен</span>}
                  </div>
                  <p className={styles.listItemMeta}>
                    Правильный ответ: {item.options?.[item.correctAnswer] || 'Не указан'}
                  </p>
                  {stats && (
                    <p className={styles.listItemMeta}>
                      Ответов: {stats.totalAnswers}, Правильно: {stats.correctAnswers} ({stats.accuracy}%)
                    </p>
                  )}
                  {item.image && (
                    <p className={styles.listItemMeta} style={{ fontSize: '12px', opacity: 0.6 }}>
                      {item.image}
                    </p>
                  )}
                </div>
                <div className={styles.itemActions}>
                  <button type='button' className={styles.editButton} onClick={() => onEdit(item)}>
                    Редактировать
                  </button>
                  <button 
                    type='button' 
                    className={`${styles.editButton} ${item.enabled ? styles.disableButton : styles.enableButton}`}
                    onClick={() => onToggleEnabled(item.id, item.enabled)}
                  >
                    {item.enabled ? 'Отключить' : 'Включить'}
                  </button>
                  <button 
                    type='button' 
                    className={`${styles.editButton} ${styles.deleteButton}`}
                    onClick={() => onDelete(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              </li>
            );
          })}
          {items.length === 0 && <p className={styles.status}>Список пуст</p>}
        </ul>
      )}
    </section>
  )
}

export default AdminItemsList
