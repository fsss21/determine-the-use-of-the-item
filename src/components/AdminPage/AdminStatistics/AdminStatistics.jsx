import React from 'react'
import styles from './AdminStatistics.module.css'

function AdminStatistics({ statistics, items, loading }) {
  const sortedStatistics = [...statistics].sort((a, b) => {
    const aErrorRate = a.totalAnswers > 0 ? (a.totalAnswers - a.correctAnswers) / a.totalAnswers : 0;
    const bErrorRate = b.totalAnswers > 0 ? (b.totalAnswers - b.correctAnswers) / b.totalAnswers : 0;
    return bErrorRate - aErrorRate;
  });

  return (
    <section className={styles.listSection}>
      <div className={styles.sectionHeader}>
        <h2>Статистика сложности вопросов</h2>
      </div>

      {loading && <p className={styles.status}>Загружаем статистику...</p>}

      {!loading && (
        <>
          {sortedStatistics.length === 0 ? (
            <p className={styles.status}>Нет данных статистики</p>
          ) : (
            <ul className={styles.list}>
              {sortedStatistics.map((stat) => {
                const item = items.find(i => i.id === stat.itemId);
                const errorRate = stat.totalAnswers > 0 
                  ? ((stat.totalAnswers - stat.correctAnswers) / stat.totalAnswers * 100).toFixed(1)
                  : 0;
                
                return (
                  <li key={stat.itemId} className={styles.listItem}>
                    <div>
                      <p className={styles.listItemTitle}>
                        {item?.name || `Предмет #${stat.itemId}`}
                      </p>
                      <p className={styles.listItemMeta}>
                        Всего ответов: {stat.totalAnswers}
                      </p>
                      <p className={styles.listItemMeta}>
                        Правильных: {stat.correctAnswers} ({stat.accuracy}%)
                      </p>
                      <p className={styles.listItemMeta} style={{ 
                        color: errorRate > 50 ? '#ffb3b3' : errorRate > 30 ? '#ffd9b3' : '#c4ffb0'
                      }}>
                        Ошибок: {stat.totalAnswers - stat.correctAnswers} ({errorRate}%)
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

export default AdminStatistics
