import React from 'react'
import styles from './StartScreen.module.css'


function StartScreen({ onStart }) {
  return (
    <div className={styles.startScreen}>
      <div className={styles.content}>
        <h1 className={styles.title}>Угадай</h1>
        <h2 className={styles.subtitle}>для чего сделан предмет?</h2>
        <button
          type="button"
          onClick={onStart}
          className={styles.startButton}
        >
          Начать игру
        </button>
      </div>
    </div>
  )
}

export default StartScreen
