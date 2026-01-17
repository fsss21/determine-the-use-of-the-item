import { useCallback, useEffect, useState } from 'react';
import styles from './AdminPage.module.css';
import AdminTabs from './AdminTabs/AdminTabs';
import AdminForm from './AdminForm/AdminForm';
import AdminItemsList from './AdminItemsList/AdminItemsList';
import AdminStatistics from './AdminStatistics/AdminStatistics';

const emptyForm = {
  name: '',
  image: '',
  options: ['', '', ''],
  correctAnswer: 0,
  historicalInfo: '',
  additionalInfo: '',
  catalogId: '',
  enabled: true,
};

const AdminPage = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('items');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      const response = await fetch('/api/items/all');
      if (!response.ok) {
        throw new Error('Не удалось загрузить предметы');
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setListError(err.message || 'Не удалось получить список предметов');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await fetch('/api/statistics');
      if (!response.ok) {
        throw new Error('Не удалось загрузить статистику');
      }
      const data = await response.json();
      setStatistics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
    loadStatistics();
  }, [loadItems, loadStatistics]);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formValues.options];
    newOptions[index] = value;
    setFormValues((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setFormValues({
      id: item.id || '',
      name: item.name || '',
      image: item.image || '',
      options: Array.isArray(item.options) && item.options.length >= 3 
        ? item.options 
        : ['', '', ''],
      correctAnswer: item.correctAnswer || 0,
      historicalInfo: item.historicalInfo || '',
      additionalInfo: item.additionalInfo || '',
      catalogId: item.catalogId || '',
      enabled: item.enabled !== undefined ? item.enabled : true,
    });
    setFormError('');
    setSuccessMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormValues(emptyForm);
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setSaving(true);

    const payload = {
      name: formValues.name.trim(),
      image: formValues.image.trim(),
      options: formValues.options.map(opt => opt.trim()).filter(opt => opt),
      correctAnswer: parseInt(formValues.correctAnswer) || 0,
      historicalInfo: formValues.historicalInfo.trim(),
      additionalInfo: formValues.additionalInfo.trim(),
      catalogId: formValues.catalogId.trim(),
      enabled: formValues.enabled,
    };

    if (!payload.name || !payload.image || payload.options.length < 3) {
      setFormError('Название, изображение и три варианта ответа обязательны');
      setSaving(false);
      return;
    }

    if (payload.correctAnswer < 0 || payload.correctAnswer >= payload.options.length) {
      setFormError('Правильный ответ должен быть индексом одного из вариантов ответа (0, 1 или 2)');
      setSaving(false);
      return;
    }

    try {
      let response;
      if (editingId) {
        response = await fetch(`/api/items/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Не удалось обновить предмет');
        }
        
        const updatedItem = await response.json();
        setItems(items.map(m => m.id === editingId ? updatedItem : m));
        setSuccessMessage('Предмет обновлён');
      } else {
        response = await fetch('/api/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Не удалось создать предмет');
        }
        
        const newItem = await response.json();
        setItems([...items, newItem]);
        setSuccessMessage('Предмет добавлен');
      }
      
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот предмет?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось удалить предмет');
      }

      setItems(items.filter(m => m.id !== id));
      setSuccessMessage('Предмет удалён');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Не удалось удалить предмет');
      setTimeout(() => setFormError(''), 5000);
    }
  };

  const toggleEnabled = async (id, currentEnabled) => {
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });

      if (!response.ok) {
        throw new Error('Не удалось изменить статус предмета');
      }

      const updatedItem = await response.json();
      setItems(items.map(m => m.id === id ? updatedItem : m));
    } catch (err) {
      setFormError(err.message || 'Не удалось изменить статус предмета');
      setTimeout(() => setFormError(''), 5000);
    }
  };

  const getItemStats = (itemId) => {
    return statistics.find(s => s.itemId === itemId);
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <p className={styles.badge}>Админ-панель</p>
          <h1>Управление игрой</h1>
        </div>
        <button onClick={onClose} className={styles.homeLink}>
          ← Вернуться к игре
        </button>
      </header>

      <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'items' && (
        <div className={styles.layout}>
          <AdminForm
            editingId={editingId}
            formValues={formValues}
            formError={formError}
            successMessage={successMessage}
            saving={saving}
            onInputChange={handleInputChange}
            onOptionChange={handleOptionChange}
            onFormValuesChange={setFormValues}
            onSubmit={handleSubmit}
            onReset={resetForm}
          />
          <AdminItemsList
            items={items}
            statistics={statistics}
            loading={loading}
            listError={listError}
            getItemStats={getItemStats}
            onEdit={startEdit}
            onDelete={handleDelete}
            onToggleEnabled={toggleEnabled}
          />
        </div>
      )}

      {activeTab === 'statistics' && (
        <AdminStatistics
          statistics={statistics}
          items={items}
          loading={statsLoading}
        />
      )}
    </div>
  );
};

export default AdminPage;
