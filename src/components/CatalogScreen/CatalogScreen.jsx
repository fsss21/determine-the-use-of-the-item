import React, { useState, useEffect, useRef } from 'react'
import styles from './CatalogScreen.module.css'
import Button from '../Button/Button'

function CatalogScreen({ items, catalogId = null, onClose, onItemClick }) {
  const [filteredItems, setFilteredItems] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentItem, setCurrentItem] = useState(null)
  const imageErrorsRef = useRef(new Set())

  useEffect(() => {
    // Проверяем, что items является массивом
    if (!Array.isArray(items)) {
      setFilteredItems([])
      setCurrentItem(null)
      return
    }

    // Если массив пустой, все равно показываем пустой список (не скрываем каталог)
    if (items.length === 0) {
      setFilteredItems([])
      setCurrentItem(null)
      return
    }

    let filtered = items
    let foundCurrentItem = null

    // Если передан catalogId, ищем похожие предметы
    if (catalogId) {
      // Находим текущий предмет по catalogId
      foundCurrentItem = items.find(item => item.catalogId === catalogId)
      setCurrentItem(foundCurrentItem)
      
      if (foundCurrentItem) {
        // Ищем похожие предметы:
        // 1. По первым словам названия (например, "Рубель" и "Рубель старинный")
        // 2. По ключевым словам в исторической справке
        // 3. Исключаем сам текущий предмет
        const currentNameWords = foundCurrentItem.name.toLowerCase().split(/\s+/)
        const currentInfoWords = (foundCurrentItem.historicalInfo || '').toLowerCase().split(/\s+/)
        
        filtered = items.filter(item => {
          // Исключаем сам предмет
          if (item.catalogId === catalogId || item.id === foundCurrentItem.id) {
            return false
          }
          
          // Проверяем совпадение по первым словам названия
          const itemNameWords = item.name.toLowerCase().split(/\s+/)
          const nameMatch = currentNameWords.some(word => 
            word.length > 3 && itemNameWords.some(iw => iw.includes(word) || word.includes(iw))
          )
          
          // Проверяем совпадение по ключевым словам в описании
          const itemInfoWords = (item.historicalInfo || '').toLowerCase().split(/\s+/)
          const infoMatch = currentInfoWords.some(word => 
            word.length > 4 && itemInfoWords.some(iw => iw.includes(word) || word.includes(iw))
          )
          
          return nameMatch || infoMatch
        })
        
        // Если похожих не найдено, показываем все остальные предметы
        if (filtered.length === 0) {
          filtered = items.filter(item => item.catalogId !== catalogId && item.id !== foundCurrentItem.id)
        }
      } else {
        // Если предмет не найден, показываем все
        filtered = items
        setCurrentItem(null)
      }
    } else {
      setCurrentItem(null)
    }

    // Фильтрация по поисковому запросу
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.historicalInfo?.toLowerCase().includes(term) ||
        item.additionalInfo?.toLowerCase().includes(term)
      )
    }

    setFilteredItems(filtered)
  }, [items, catalogId, searchTerm])

  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item)
    }
  }

  return (
    <div className={styles.catalogScreen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {catalogId && currentItem
              ? `Похожие находки: ${currentItem.name}`
              : catalogId
              ? 'Похожие находки'
              : 'Каталог предметов'
            }
          </h2>
          <Button
            onClick={onClose}
            variant="secondary"
            className={styles.closeButton}
          >
            Закрыть
          </Button>
        </div>

        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.itemsGrid}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className={styles.itemCard}
                onClick={() => handleItemClick(item)}
              >
                <div className={styles.itemImage}>
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      // Предотвращаем бесконечный цикл - используем Set для отслеживания ошибок
                      const imgKey = `${item.id}-${item.image}`
                      if (!imageErrorsRef.current.has(imgKey)) {
                        imageErrorsRef.current.add(imgKey)
                        const fallbackSrc = 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(item.name)
                        // Проверяем, что текущий src не равен fallback, чтобы избежать цикла
                        if (e.target.src !== fallbackSrc && e.target.dataset.fallback !== 'true') {
                          e.target.dataset.fallback = 'true'
                          e.target.src = fallbackSrc
                        } else {
                          // Если и fallback не загрузился, скрываем изображение
                          e.target.style.display = 'none'
                        }
                      } else {
                        // Если уже была ошибка, скрываем изображение
                        e.target.style.display = 'none'
                      }
                    }}
                    loading="lazy"
                  />
                </div>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemDescription}>
                    {item.historicalInfo?.substring(0, 150)}
                    {item.historicalInfo?.length > 150 ? '...' : ''}
                  </p>
                  {item.catalogId && (
                    <span className={styles.catalogId}>ID: {item.catalogId}</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>Предметы не найдены</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <p className={styles.itemsCount}>
            Найдено предметов: {filteredItems.length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CatalogScreen
