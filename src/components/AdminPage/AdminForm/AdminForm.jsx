import React from 'react'
import styles from './AdminForm.module.css'

function AdminForm({
  editingId,
  formValues,
  formError,
  successMessage,
  saving,
  onInputChange,
  onOptionChange,
  onFormValuesChange,
  onSubmit,
  onReset
}) {
  return (
    <section className={styles.formSection}>
      <h2>{editingId ? 'Редактировать предмет' : 'Добавить новый предмет'}</h2>
      <form className={styles.form} onSubmit={onSubmit}>
        {editingId && (
          <label className={styles.label}>
            ID
            <input 
              type='number' 
              name='id' 
              value={formValues.id} 
              onChange={onInputChange} 
              placeholder='1' 
              min='1' 
              readOnly
            />
          </label>
        )}

        <label className={styles.label}>
          Название предмета
          <input 
            type='text' 
            name='name' 
            value={formValues.name} 
            onChange={onInputChange} 
            placeholder='Например, Рубель' 
          />
        </label>

        <label className={styles.label}>
          Ссылка на изображение
          <input 
            type='text' 
            name='image' 
            value={formValues.image} 
            onChange={onInputChange} 
            placeholder='https://example.com/image.jpg' 
          />
        </label>

        <div className={styles.label}>
          <p style={{ marginBottom: '1.5vh' }}>Варианты ответов (3 штуки)</p>
          {[0, 1, 2].map((index) => (
            <label key={index} style={{ marginBottom: '1vh' }}>
              <span style={{ fontSize: 'clamp(14px, 3vw, 18px)', opacity: 0.8 }}>
                Вариант {index + 1} {index === formValues.correctAnswer && '(правильный)'}
              </span>
              <input 
                type='text' 
                value={formValues.options[index] || ''} 
                onChange={(e) => onOptionChange(index, e.target.value)} 
                placeholder={`Вариант ответа ${index + 1}`}
                style={{ marginTop: '0.5vh' }}
              />
              <button
                type='button'
                onClick={() => onFormValuesChange(prev => ({ ...prev, correctAnswer: index }))}
                className={styles.optionSelectButton}
                style={{
                  marginTop: '0.5vh',
                  opacity: formValues.correctAnswer === index ? 1 : 0.6
                }}
              >
                {formValues.correctAnswer === index ? '✓ Правильный ответ' : 'Сделать правильным'}
              </button>
            </label>
          ))}
        </div>

        <label className={styles.label}>
          Правильный ответ (индекс 0-2)
          <input 
            type='number' 
            name='correctAnswer' 
            value={formValues.correctAnswer} 
            onChange={onInputChange} 
            min='0' 
            max='2' 
          />
        </label>

        <label className={styles.label}>
          Историческая справка
          <textarea 
            name='historicalInfo' 
            value={formValues.historicalInfo} 
            onChange={onInputChange} 
            rows={4} 
            placeholder='Историческая информация о предмете...' 
          />
        </label>

        <label className={styles.label}>
          Дополнительная информация
          <textarea 
            name='additionalInfo' 
            value={formValues.additionalInfo} 
            onChange={onInputChange} 
            rows={3} 
            placeholder='Дополнительная информация (опционально)...' 
          />
        </label>

        <label className={styles.label}>
          ID в каталоге
          <input 
            type='text' 
            name='catalogId' 
            value={formValues.catalogId} 
            onChange={onInputChange} 
            placeholder='rubel-001' 
          />
        </label>

        <label className={styles.label} style={{ flexDirection: 'row', alignItems: 'center', gap: '1vw' }}>
          <input 
            type='checkbox' 
            name='enabled' 
            checked={formValues.enabled} 
            onChange={onInputChange} 
          />
          <span>Включен в игру</span>
        </label>

        {formValues.image?.trim() && (
          <div className={styles.preview}>
            <h3 className={styles.previewTitle}>Превью изображения</h3>
            <div className={styles.previewContainer}>
              <img 
                src={formValues.image.trim()} 
                alt={formValues.name || 'Preview'} 
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                onError={(e) => {
                  // Предотвращаем повторные попытки загрузки
                  if (e.target.dataset.error !== 'true') {
                    e.target.dataset.error = 'true'
                    e.target.style.display = 'none'
                  }
                }}
                loading="lazy"
              />
            </div>
          </div>
        )}

        {formError && <p className={styles.error}>{formError}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}

        <div className={styles.formActions}>
          {editingId && (
            <button type='button' className={styles.secondaryButton} onClick={onReset}>
              Отменить
            </button>
          )}
          <button type='submit' className={styles.primaryButton} disabled={saving}>
            {saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default AdminForm
