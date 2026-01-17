import React from 'react'
import styles from './StartScreen.module.css'
import Button from '../Button/Button'

function StartScreen({ onStart }) {
  return (
    <div className={styles.startScreen}>
      <div className={styles.content}>
        <h1 className={styles.title}>Для чего это использовали?</h1>
        <h2 className={styles.subtitle}>Угадайте назначение старинных предметов</h2>
        <Button 
          onClick={onStart}
          variant="primary"
          className={styles.startButton}
        >
          Начать
        </Button>
      </div>
    </div>
  )
}

export default StartScreen
