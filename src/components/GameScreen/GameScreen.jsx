import React, { useState } from 'react'
import styles from './GameScreen.module.css'
import Button from '../Button/Button'

function GameScreen({ item, onAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null)

  const handleAnswer = (answerIndex) => {
    setSelectedAnswer(answerIndex)
    setTimeout(() => {
      onAnswer(answerIndex)
    }, 300)
  }

  return (
    <div className={styles.gameScreen}>
      <div className={styles.container}>
        <div className={styles.imageContainer}>
          <img 
            src={item.image} 
            alt={item.name}
            className={styles.itemImage}
          />
        </div>
        
        <h2 className={styles.itemName}>{item.name}</h2>
        
        <div className={styles.optionsContainer}>
          {item.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(index)}
              variant={selectedAnswer === index ? 'secondary' : 'primary'}
              className={styles.optionButton}
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GameScreen
