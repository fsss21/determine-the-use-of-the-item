import React, { useState, useRef, useEffect } from 'react'
import styles from './GameScreen.module.css'
import Button from '../Button/Button'

function GameScreen({ item, onAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const imageErrorRef = useRef(false)

  // Сбрасываем флаг ошибки при изменении предмета
  useEffect(() => {
    imageErrorRef.current = false
  }, [item?.id, item?.image])

  // Проверка на существование item и его свойств
  if (!item || !item.options || !Array.isArray(item.options) || item.options.length === 0) {
    return (
      <div className={styles.gameScreen}>
        <div className={styles.container}>
          <p>Ошибка: данные предмета не загружены</p>
        </div>
      </div>
    )
  }

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
            key={`${item.id}-${item.image}`}
            src={item.image || 'https://via.placeholder.com/400x400?text=Изображение'} 
            alt={item.name || 'Предмет'}
            className={styles.itemImage}
            onError={(e) => {
              // Предотвращаем бесконечный цикл - меняем src только один раз
              if (!imageErrorRef.current && e.target.src !== e.target.dataset.fallback) {
                imageErrorRef.current = true
                const fallbackSrc = 'https://via.placeholder.com/400x400?text=' + encodeURIComponent(item.name || 'Предмет')
                e.target.dataset.fallback = fallbackSrc
                e.target.src = fallbackSrc
              } else {
                // Если и fallback не загрузился, скрываем изображение
                e.target.style.display = 'none'
              }
            }}
            onLoad={(e) => {
              // Сбрасываем флаг ошибки при успешной загрузке и показываем изображение
              imageErrorRef.current = false
              if (e.target.style.display === 'none') {
                e.target.style.display = ''
              }
            }}
            loading="lazy"
          />
        </div>
        
        <h2 className={styles.itemName}>{item.name || 'Без названия'}</h2>
        
        <div className={styles.optionsContainer}>
          {item.options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(index)}
              variant={selectedAnswer === index ? 'secondary' : 'primary'}
              className={styles.optionButton}
            >
              {option || `Вариант ${index + 1}`}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GameScreen
