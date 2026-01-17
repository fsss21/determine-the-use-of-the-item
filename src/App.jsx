import React, { useState, useEffect } from 'react'
import styles from './App.module.css'
import Header from './components/Header/Header'
import StartScreen from './components/StartScreen/StartScreen'
import GameScreen from './components/GameScreen/GameScreen'
import ResultScreen from './components/ResultScreen/ResultScreen'
import AdminPage from './components/AdminPage/AdminPage'

const GAME_STATES = {
  START: 'start',
  PLAYING: 'playing',
  RESULT: 'result',
  ADMIN: 'admin'
}

function App() {
  const [gameState, setGameState] = useState(GAME_STATES.START)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [gameItems, setGameItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGameItems()
  }, [])

  const handleAdmin = () => {
    setGameState(GAME_STATES.ADMIN)
  }

  const handleAdminClose = () => {
    setGameState(GAME_STATES.START)
    loadGameItems() // Перезагружаем предметы после возможных изменений
  }

  // Обработчик клавиатуры для открытия админ-панели (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && (event.key === 'A' || event.key === 'а')) {
        event.preventDefault()
        setGameState(prev => {
          if (prev === GAME_STATES.ADMIN) {
            // Закрываем админку и перезагружаем данные
            setTimeout(() => loadGameItems(), 100)
            return GAME_STATES.START
          } else {
            return GAME_STATES.ADMIN
          }
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const loadGameItems = async () => {
    try {
      const response = await fetch('/api/items')
      if (response.ok) {
        const data = await response.json()
        setGameItems(Array.isArray(data) ? data : [])
        setLoading(false)
        return
      } else {
        console.error('Failed to load game items from API, trying public folder')
      }
    } catch (error) {
      console.error('Error loading game items from API, trying public folder:', error)
    }
    
    // Fallback: пробуем загрузить из public/json/gameItems.json напрямую
    try {
      const response = await fetch('/json/gameItems.json')
      if (response.ok) {
        const data = await response.json()
        const enabledItems = Array.isArray(data) ? data.filter(item => item.enabled !== false) : []
        setGameItems(enabledItems)
      } else {
        console.error('Failed to load game items from public folder')
        setGameItems([])
      }
    } catch (error) {
      console.error('Error loading game items from public folder:', error)
      setGameItems([])
    } finally {
      setLoading(false)
    }
  }

  const currentItem = gameItems[currentItemIndex]

  const handleStart = () => {
    setGameState(GAME_STATES.PLAYING)
    setCurrentItemIndex(0)
    setSelectedAnswer(null)
  }

  const handleAnswer = async (answerIndex) => {
    setSelectedAnswer(answerIndex)
    setGameState(GAME_STATES.RESULT)
    
    // Сохраняем статистику
    if (currentItem) {
      const isCorrect = answerIndex === currentItem.correctAnswer
      try {
        await fetch('/api/statistics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId: currentItem.id,
            selectedAnswer: answerIndex,
            isCorrect: isCorrect
          }),
        })
      } catch (error) {
        console.error('Error saving statistics:', error)
      }
    }
  }

  const handleNext = () => {
    const nextIndex = currentItemIndex + 1
    if (nextIndex < gameItems.length) {
      setCurrentItemIndex(nextIndex)
      setSelectedAnswer(null)
      setGameState(GAME_STATES.PLAYING)
    } else {
      // Игра закончена, возвращаемся на стартовый экран
      setGameState(GAME_STATES.START)
      setCurrentItemIndex(0)
      setSelectedAnswer(null)
    }
  }

  const handleViewCatalog = (catalogId = null) => {
    // TODO: Интеграция с каталогом
    console.log('Переход к каталогу', catalogId || 'общий каталог')
    // Здесь будет переход к каталогу
  }

  const renderScreen = () => {
    if (loading) {
      return (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: '#333'
        }}>
          Загрузка...
        </div>
      )
    }

    switch (gameState) {
      case GAME_STATES.ADMIN:
        return <AdminPage onClose={handleAdminClose} />
      
      case GAME_STATES.START:
        return <StartScreen onStart={handleStart} />
      
      case GAME_STATES.PLAYING:
        if (!currentItem) {
          return (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: '#333'
            }}>
              Нет доступных предметов для игры
            </div>
          )
        }
        return (
          <GameScreen 
            item={currentItem} 
            onAnswer={handleAnswer}
          />
        )
      
      case GAME_STATES.RESULT:
        if (!currentItem) {
          return <StartScreen onStart={handleStart} />
        }
        return (
          <ResultScreen
            item={currentItem}
            selectedAnswer={selectedAnswer}
            onNext={handleNext}
            onViewCatalog={handleViewCatalog}
          />
        )
      
      default:
        return <StartScreen onStart={handleStart} />
    }
  }

  return (
    <div className={styles.app}>
      {gameState !== GAME_STATES.ADMIN && <Header />}
      {renderScreen()}
    </div>
  )
}

export default App
