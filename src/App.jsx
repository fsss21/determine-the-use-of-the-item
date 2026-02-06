import React, { useState, useEffect, useCallback } from 'react'
import styles from './App.module.css'
import StartScreen from './components/StartScreen/StartScreen'
import GameScreen from './components/GameScreen/GameScreen'
import ResultScreen from './components/ResultScreen/ResultScreen'
import FinishedScreen from './components/FinishedScreen/FinishedScreen'
import AdminPage from './components/AdminPage/AdminPage'
import CatalogScreen from './components/CatalogScreen/CatalogScreen'

const GAME_STATES = {
  START: 'start',
  PLAYING: 'playing',
  RESULT: 'result',
  FINISHED: 'finished',
  ADMIN: 'admin',
  CATALOG: 'catalog'
}

function App() {
  const [gameState, setGameState] = useState(GAME_STATES.START)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [gameItems, setGameItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [catalogId, setCatalogId] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [fromFinishedScreen, setFromFinishedScreen] = useState(false)

  const loadGameItems = useCallback(async () => {
    try {
      const response = await fetch('/api/items')
      if (response.ok) {
        const data = await response.json()
        setGameItems(Array.isArray(data) ? data : [])
        setLoading(false)
        return
      }
    } catch (error) {
      // Тихо игнорируем ошибки подключения к API (сервер может быть не запущен)
      // Это нормально, так как у нас есть fallback механизм
    }
    
    // Fallback: пробуем загрузить из public/json/gameItems.json напрямую
    try {
      const response = await fetch('/json/gameItems.json')
      if (response.ok) {
        const data = await response.json()
        const enabledItems = Array.isArray(data) ? data.filter(item => item.enabled !== false) : []
        setGameItems(enabledItems)
      } else {
        console.error('Не удалось загрузить предметы из public/json/gameItems.json')
        setGameItems([])
      }
    } catch (error) {
      console.error('Ошибка загрузки предметов из public/json/gameItems.json:', error)
      setGameItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGameItems()
  }, [loadGameItems])

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
  }, [loadGameItems])

  const currentItem = gameItems[currentItemIndex]

  const handleStart = () => {
    setGameState(GAME_STATES.PLAYING)
    setCurrentItemIndex(0)
    setSelectedAnswer(null)
    setCorrectCount(0)
  }

  const handleAnswer = async (answerIndex) => {
    setSelectedAnswer(answerIndex)
    const item = gameItems[currentItemIndex]
    const isCorrect = item && answerIndex === item.correctAnswer
    if (isCorrect) {
      setCorrectCount(c => c + 1)
    }
    setGameState(GAME_STATES.RESULT)
    
    // Сохраняем статистику - используем актуальный индекс
    if (item) {
      try {
        await fetch('/api/statistics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            itemId: item.id,
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
      // Игра закончена — показываем финальный экран
      setGameState(GAME_STATES.FINISHED)
      setCurrentItemIndex(0)
      setSelectedAnswer(null)
    }
  }

  const handlePlayAgain = () => {
    setGameState(GAME_STATES.START)
    setCurrentItemIndex(0)
    setSelectedAnswer(null)
    setCorrectCount(0)
  }

  const handleViewCatalog = (itemCatalogId = null) => {
    setCatalogId(itemCatalogId)
    setFromFinishedScreen(gameState === GAME_STATES.FINISHED)
    setGameState(GAME_STATES.CATALOG)
  }

  const handleCatalogClose = () => {
    setCatalogId(null)
    if (fromFinishedScreen) {
      setGameState(GAME_STATES.FINISHED)
    } else {
      const item = gameItems[currentItemIndex]
      if (item && selectedAnswer !== null) {
        setGameState(GAME_STATES.RESULT)
      } else {
        setGameState(GAME_STATES.START)
      }
    }
  }

  const handleBackToFinished = () => {
    setCatalogId(null)
    setFromFinishedScreen(true)
    setGameState(GAME_STATES.FINISHED)
  }

  const handleCatalogItemClick = (item) => {
    // При клике на предмет в каталоге можно показать его детали
    // Пока просто закрываем каталог
    handleCatalogClose()
  }

  const renderScreen = () => {
    if (loading) {
      return (
        <div className={styles.screenMessage}>
          Загрузка...
        </div>
      )
    }

    switch (gameState) {
      case GAME_STATES.ADMIN:
        return <AdminPage onClose={handleAdminClose} />
      
      case GAME_STATES.CATALOG:
        return (
          <CatalogScreen
            items={gameItems}
            catalogId={catalogId}
            onClose={handleCatalogClose}
            onBackToFinished={fromFinishedScreen ? handleBackToFinished : null}
            onItemClick={handleCatalogItemClick}
          />
        )

      case GAME_STATES.FINISHED:
        return (
          <FinishedScreen
            correctCount={correctCount}
            totalCount={gameItems.length}
            onPlayAgain={handlePlayAgain}
            onViewCatalog={() => handleViewCatalog(null)}
          />
        )
      
      case GAME_STATES.START:
        return <StartScreen onStart={handleStart} />
      
      case GAME_STATES.PLAYING:
        if (!currentItem) {
          return (
            <div className={styles.screenMessage}>
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
      {renderScreen()}
    </div>
  )
}

export default App
