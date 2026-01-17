import React from 'react'
import styles from './ResultScreen.module.css'
import Button from '../Button/Button'

function ResultScreen({ item, selectedAnswer, onNext, onViewCatalog }) {
  const isCorrect = selectedAnswer === item.correctAnswer
  const correctOption = item.options[item.correctAnswer]

  return (
    <div className={styles.resultScreen}>
      <div className={styles.container}>
        <div className={styles.resultHeader}>
          <div className={`${styles.resultIcon} ${isCorrect ? styles.correct : styles.incorrect}`}>
            {isCorrect ? '✓' : '✗'}
          </div>
          <h2 className={styles.resultTitle}>
            {isCorrect ? 'Правильно!' : 'Неправильно'}
          </h2>
          <p className={styles.correctAnswer}>
            {!isCorrect && `Правильный ответ: ${correctOption}`}
          </p>
        </div>

        <div className={styles.infoSection}>
          <div className={styles.historicalInfo}>
            <h3 className={styles.infoTitle}>Историческая справка</h3>
            <p className={styles.infoText}>{item.historicalInfo}</p>
          </div>

          {item.additionalInfo && (
            <div className={styles.additionalInfo}>
              <p className={styles.additionalText}>{item.additionalInfo}</p>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <Button
            onClick={onNext}
            variant="primary"
            className={styles.actionButton}
          >
            Следующий предмет
          </Button>
          <Button
            onClick={onViewCatalog}
            variant="secondary"
            className={styles.actionButton}
          >
            Перейти к каталогу
          </Button>
          <Button
            onClick={() => onViewCatalog(item.catalogId)}
            variant="secondary"
            className={styles.actionButton}
          >
            Найти похожие находки
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResultScreen
