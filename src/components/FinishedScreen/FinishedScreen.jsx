import React from 'react'
import styles from './FinishedScreen.module.css'

function FinishedScreen({ correctCount, totalCount, onPlayAgain, onViewCatalog }) {
  const getSupportMessage = () => {
    if (totalCount === 0) return 'Попробуйте начать игру!'
    const percent = Math.round((correctCount / totalCount) * 100)
    if (percent === 100) return 'Отлично! Вы настоящий знаток старинных предметов!'
    if (percent >= 80) return 'Превосходно! Вы хорошо разбираетесь в истории.'
    if (percent >= 50) return 'Неплохой результат! Продолжайте изучать старинные предметы.'
    return 'Не сдавайтесь! С каждой игрой вы узнаёте больше.'
  }

  return (
    <div className={styles.finishedScreen}>
      <div className={styles.container}>
        <h1 className={styles.title}>Игра завершена!</h1>
        <div className={styles.blockAnswer}>
          <p className={styles.stats}>
            Вы угадали {correctCount} из {totalCount} предметов
          </p>
          <p className={styles.supportMessage}>{getSupportMessage()}</p>
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={onPlayAgain} className={styles.actionButton}>
            Играть снова
          </button>
          <button type="button" onClick={onViewCatalog} className={styles.actionButton}>
            Перейти к каталогу находок
          </button>
        </div>
      </div>
    </div>
  )
}

export default FinishedScreen
