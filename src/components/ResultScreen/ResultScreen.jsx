import React from 'react'
import styles from './ResultScreen.module.css'


function ResultScreen({ item, selectedAnswer, onNext, onViewCatalog }) {
  // Проверка на существование item и его свойств
  if (!item || !item.options || selectedAnswer === null || selectedAnswer === undefined) {
    return null
  }

  const isCorrect = selectedAnswer === item.correctAnswer
  const correctOption = item.options[item.correctAnswer] || 'Неизвестно'

  return (
    <div className={styles.resultScreen}>
      <div className={styles.container}>
        <div className={`${styles.resultHeader} ${!isCorrect ? styles.incorrect : ''}`}>
          <div className={`${styles.resultIcon} ${isCorrect ? styles.correct : styles.incorrect}`}>
            {isCorrect ? '✓' : '✗'}
          </div>
          <h2 className={styles.resultTitle}>
            {isCorrect ? 'Правильно!' : 'Неправильно'}
          </h2>
          <p className={styles.correctAnswer}>
            {!isCorrect && `Правильный ответ: ${correctOption}`}
          </p>

          <div className={styles.historicalInfo}>
            <h3 className={styles.infoTitle}>Историческая справка</h3>
            <p className={styles.infoText}>{item.historicalInfo || 'Нет информации'}</p>
          </div>

          {item.additionalInfo && (
            <div className={styles.additionalInfo}>
              <p className={styles.additionalText}>{item.additionalInfo}</p>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onNext} className={styles.actionButton}>
            Следующий предмет
          </button>
          <button type="button" onClick={onViewCatalog} className={styles.actionButton}>
            Перейти к каталогу
          </button>
          <button type="button" onClick={() => onViewCatalog(item.catalogId)} className={styles.actionButton}>
            Найти похожие находки
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResultScreen
