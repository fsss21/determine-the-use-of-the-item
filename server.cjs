/* eslint-env node */
const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const { existsSync } = require('fs');
const { platform } = require('os');

const app = express();
const PORT = 3001;

// Определяем путь к папке dist
// При запуске через pkg, пути к файлам отличаются
const fs = require('fs');
let distPath;

if (process.pkg) {
  // При запуске через pkg, assets находятся в snapshot
  // Пробуем разные возможные пути
  const possiblePaths = [
    path.join(__dirname, 'dist'), // /snapshot/architects-office/dist
    path.join(__dirname, '../dist'), // альтернативный путь
    path.dirname(process.execPath), // рядом с исполняемым файлом
    path.join(path.dirname(process.execPath), 'dist'), // dist рядом с exe
  ];

  // Ищем существующий путь
  for (const testPath of possiblePaths) {
    if (existsSync(testPath) && existsSync(path.join(testPath, 'index.html'))) {
      distPath = testPath;
      console.log('PKG mode - Found dist at:', distPath);
      break;
    }
  }

  // Если не нашли, используем __dirname/dist и выводим отладочную информацию
  if (!distPath) {
    distPath = path.join(__dirname, 'dist');
    console.log('PKG mode - __dirname:', __dirname);
    console.log('PKG mode - process.execPath:', process.execPath);
    console.log('PKG mode - distPath:', distPath);

    // Список файлов в __dirname для отладки
    try {
      const files = fs.readdirSync(__dirname);
      console.log('PKG mode - files in __dirname:', files);
    } catch (e) {
      console.log('PKG mode - cannot read __dirname:', e.message);
    }

    // Проверяем dist папку
    try {
      if (existsSync(distPath)) {
        const distFiles = fs.readdirSync(distPath);
        console.log('PKG mode - files in dist:', distFiles);
      } else {
        console.log('PKG mode - dist folder does not exist at:', distPath);
      }
    } catch (e) {
      console.log('PKG mode - cannot read dist:', e.message);
    }
  }
} else {
  // При обычном запуске, dist находится рядом с server.cjs
  distPath = path.join(__dirname, 'dist');
}

// Middleware для парсинга JSON
app.use(express.json());

// Обслуживание статических файлов из папки dist
app.use(express.static(distPath));

// Функция для получения пути к gameItems.json
function getGameItemsPath() {
  // Приоритет: public/json для разработки, затем dist/json при сборке
  const publicPath = path.join(__dirname, 'public', 'json', 'gameItems.json');
  const distJsonPath = path.join(distPath, 'json', 'gameItems.json');
  const distPathOld = path.join(distPath, 'gameItems.json');
  
  // Проверяем в порядке приоритета
  if (existsSync(publicPath)) {
    return publicPath;
  }
  if (existsSync(distJsonPath)) {
    return distJsonPath;
  }
  // Для обратной совместимости
  if (existsSync(distPathOld)) {
    return distPathOld;
  }
  // По умолчанию используем public/json
  return publicPath;
}

// Функция для получения пути к statistics.json
function getStatisticsPath() {
  // Приоритет: public/json для разработки, затем dist/json при сборке
  const publicPath = path.join(__dirname, 'public', 'json', 'statistics.json');
  const distJsonPath = path.join(distPath, 'json', 'statistics.json');
  const distPathOld = path.join(distPath, 'statistics.json');
  
  // Проверяем в порядке приоритета
  if (existsSync(publicPath)) {
    return publicPath;
  }
  if (existsSync(distJsonPath)) {
    return distJsonPath;
  }
  // Для обратной совместимости
  if (existsSync(distPathOld)) {
    return distPathOld;
  }
  // По умолчанию используем public/json
  return publicPath;
}

// API endpoints для работы с игровыми предметами
app.get('/api/items', (req, res) => {
  try {
    const itemsPath = getGameItemsPath();
    
    // Если файл не существует, создаем его с начальными данными
    if (!existsSync(itemsPath)) {
      const defaultItems = [
        {
          id: 1,
          name: 'Рубель',
          image: 'https://via.placeholder.com/400x400?text=Рубель',
          options: [
            'Для глажения белья',
            'Для приготовления пищи',
            'Для музицирования'
          ],
          correctAnswer: 0,
          historicalInfo: 'Рубель использовался для глажения белья до появления утюгов. Мокрое белье наматывали на валик и прокатывали рубелем.',
          additionalInfo: 'В Уткиной даче прачечная располагалась в служебном корпусе',
          catalogId: 'rubel-001',
          enabled: true
        }
      ];
      
      // Создаем директорию если её нет
      const dir = path.dirname(itemsPath);
      if (!existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Создаем файл с начальными данными
      fs.writeFileSync(itemsPath, JSON.stringify(defaultItems, null, 2), 'utf8');
      console.log('Created default gameItems.json at:', itemsPath);
      return res.json(defaultItems.filter(item => item.enabled !== false));
    }
    
    const data = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(data);
    // Возвращаем только включенные предметы для игры
    const enabledItems = items.filter(item => item.enabled !== false);
    res.json(enabledItems);
  } catch (error) {
    console.error('Error reading game items:', error);
    res.status(500).json({ error: 'Не удалось загрузить предметы' });
  }
});

// Получить все предметы (включая отключенные) для админки
app.get('/api/items/all', (req, res) => {
  try {
    const itemsPath = getGameItemsPath();
    if (!existsSync(itemsPath)) {
      return res.json([]);
    }
    const data = fs.readFileSync(itemsPath, 'utf8');
    const items = JSON.parse(data);
    res.json(items);
  } catch (error) {
    console.error('Error reading all game items:', error);
    res.status(500).json({ error: 'Не удалось загрузить предметы' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const itemsPath = getGameItemsPath();
    let items = [];
    
    // Читаем существующие предметы
    if (existsSync(itemsPath)) {
      const data = fs.readFileSync(itemsPath, 'utf8');
      items = JSON.parse(data);
    }
    
    // Добавляем новый предмет
    const newItem = {
      id: Math.max(...items.map(m => m.id || 0), 0) + 1,
      enabled: req.body.enabled !== undefined ? req.body.enabled : true,
      ...req.body
    };
    items.push(newItem);
    
    // Сохраняем в файл
    fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2), 'utf8');
    
    res.json(newItem);
  } catch (error) {
    console.error('Error creating game item:', error);
    res.status(500).json({ error: 'Не удалось создать предмет' });
  }
});

app.put('/api/items/:id', (req, res) => {
  try {
    const itemsPath = getGameItemsPath();
    if (!existsSync(itemsPath)) {
      return res.status(404).json({ error: 'Файл предметов не найден' });
    }
    
    const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
    const id = parseInt(req.params.id);
    const index = items.findIndex(m => m.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Предмет не найден' });
    }
    
    // Обновляем предмет
    items[index] = { ...items[index], ...req.body, id };
    
    // Сохраняем в файл
    fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2), 'utf8');
    
    res.json(items[index]);
  } catch (error) {
    console.error('Error updating game item:', error);
    res.status(500).json({ error: 'Не удалось обновить предмет' });
  }
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const itemsPath = getGameItemsPath();
    if (!existsSync(itemsPath)) {
      return res.status(404).json({ error: 'Файл предметов не найден' });
    }
    
    const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
    const id = parseInt(req.params.id);
    const filteredItems = items.filter(m => m.id !== id);
    
    if (filteredItems.length === items.length) {
      return res.status(404).json({ error: 'Предмет не найден' });
    }
    
    // Удаляем статистику для этого предмета
    const statsPath = getStatisticsPath();
    if (existsSync(statsPath)) {
      const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      const filteredStats = stats.filter(s => s.itemId !== id);
      fs.writeFileSync(statsPath, JSON.stringify(filteredStats, null, 2), 'utf8');
    }
    
    // Сохраняем в файл
    fs.writeFileSync(itemsPath, JSON.stringify(filteredItems, null, 2), 'utf8');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting game item:', error);
    res.status(500).json({ error: 'Не удалось удалить предмет' });
  }
});

// API endpoints для статистики
app.post('/api/statistics', (req, res) => {
  try {
    const statsPath = getStatisticsPath();
    let statistics = [];
    
    // Читаем существующую статистику
    if (existsSync(statsPath)) {
      const data = fs.readFileSync(statsPath, 'utf8');
      statistics = JSON.parse(data);
    }
    
    const { itemId, selectedAnswer, isCorrect } = req.body;
    
    // Ищем существующую запись для этого предмета
    let statEntry = statistics.find(s => s.itemId === itemId);
    
    if (statEntry) {
      // Обновляем существующую статистику
      statEntry.totalAnswers = (statEntry.totalAnswers || 0) + 1;
      statEntry.correctAnswers = (statEntry.correctAnswers || 0) + (isCorrect ? 1 : 0);
      
      // Обновляем статистику по вариантам ответов
      if (!statEntry.answerStats) {
        statEntry.answerStats = {};
      }
      const answerKey = `option_${selectedAnswer}`;
      statEntry.answerStats[answerKey] = (statEntry.answerStats[answerKey] || 0) + 1;
      
      // Вычисляем процент правильных ответов
      statEntry.accuracy = ((statEntry.correctAnswers / statEntry.totalAnswers) * 100).toFixed(2);
    } else {
      // Создаем новую запись статистики
      statEntry = {
        itemId,
        totalAnswers: 1,
        correctAnswers: isCorrect ? 1 : 0,
        answerStats: {
          [`option_${selectedAnswer}`]: 1
        },
        accuracy: isCorrect ? '100.00' : '0.00'
      };
      statistics.push(statEntry);
    }
    
    // Сохраняем статистику
    fs.writeFileSync(statsPath, JSON.stringify(statistics, null, 2), 'utf8');
    
    res.json(statEntry);
  } catch (error) {
    console.error('Error saving statistics:', error);
    res.status(500).json({ error: 'Не удалось сохранить статистику' });
  }
});

app.get('/api/statistics', (req, res) => {
  try {
    const statsPath = getStatisticsPath();
    if (!existsSync(statsPath)) {
      return res.json([]);
    }
    const data = fs.readFileSync(statsPath, 'utf8');
    const statistics = JSON.parse(data);
    res.json(statistics);
  } catch (error) {
    console.error('Error reading statistics:', error);
    res.status(500).json({ error: 'Не удалось загрузить статистику' });
  }
});

// Для всех остальных маршрутов возвращаем index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Функция для запуска браузера в киоск-режиме
function launchBrowser() {
  const currentPlatform = platform();
  const url = `http://localhost:${PORT}/`;

  setTimeout(() => {
    if (currentPlatform === 'win32') {
      // Windows
      const chromePath = process.env['ProgramFiles'] + '\\Google\\Chrome\\Application\\chrome.exe';
      const edgePath = process.env['ProgramFiles(x86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe';

      if (existsSync(chromePath)) {
        // Запуск Chrome в киоск-режиме
        const chromeArgs = [
          '--disable-web-security',
          `--user-data-dir="${process.env.TEMP}\\ChromeTempProfile"`,
          '--autoplay-policy=no-user-gesture-required',
          `--app="${url}"`,
          '--start-fullscreen',
          '--kiosk',
          '--disable-features=Translate,ContextMenuSearchWebFor,ImageSearch',
        ].join(' ');

        exec(`"${chromePath}" ${chromeArgs}`, (error) => {
          if (error) {
            console.error('Ошибка запуска Chrome:', error);
          }
        });
      } else if (existsSync(edgePath)) {
        // Настройка реестра для Edge (требует прав администратора)
        const regCommands = [
          'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "TranslateEnabled" /t REG_DWORD /d 0 /f',
          'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "ContextMenuSearchEnabled" /t REG_DWORD /d 0 /f',
          'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "VisualSearchEnabled" /t REG_DWORD /d 0 /f',
        ];

        // Выполняем команды реестра (могут не сработать без прав администратора)
        regCommands.forEach((cmd) => {
          exec(cmd, () => {}); // Игнорируем ошибки, если нет прав
        });

        // Запуск Edge в киоск-режиме
        const edgeArgs = [
          `--kiosk "${url}"`,
          '--edge-kiosk-type=fullscreen',
          '--no-first-run',
          '--disable-features=msEdgeSidebarV2,msHub,msWelcomePage,msTranslations,msContextMenuSearch,msVisualSearch',
          '--disable-component-update',
          '--disable-prompt-on-repost',
          '--kiosk-idle-timeout-minutes=0',
        ].join(' ');

        exec(`"${edgePath}" ${edgeArgs}`, (error) => {
          if (error) {
            console.error('Ошибка запуска Edge:', error);
          }
        });
      } else {
        console.log('Не найден ни Chrome, ни Edge. Откройте браузер вручную.');
        console.log(`URL: ${url}`);
      }

      // Убиваем explorer.exe через 12 секунд (опционально, можно закомментировать)
      setTimeout(() => {
        console.log('Kill Explorer...');
        exec('taskkill /f /im explorer.exe', (error) => {
          if (error) {
            // Игнорируем ошибки, если нет прав или explorer уже закрыт
          }
        });
      }, 12000);
    } else if (currentPlatform === 'darwin') {
      // macOS
      const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      const safariPath = '/Applications/Safari.app';
      const edgePath = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';

      if (existsSync(chromePath)) {
        // Запуск Chrome в киоск-режиме на macOS
        const chromeArgs = [
          '--disable-web-security',
          `--user-data-dir="${process.env.TMPDIR || '/tmp'}/ChromeTempProfile"`,
          '--autoplay-policy=no-user-gesture-required',
          `--app="${url}"`,
          '--start-fullscreen',
          '--kiosk',
          '--disable-features=Translate,ContextMenuSearchWebFor,ImageSearch',
        ].join(' ');

        exec(`"${chromePath}" ${chromeArgs}`, (error) => {
          if (error) {
            console.error('Ошибка запуска Chrome:', error);
          }
        });
      } else if (existsSync(edgePath)) {
        // Запуск Edge в киоск-режиме на macOS
        const edgeArgs = [
          `--kiosk "${url}"`,
          '--edge-kiosk-type=fullscreen',
          '--no-first-run',
          '--disable-features=msEdgeSidebarV2,msHub,msWelcomePage,msTranslations,msContextMenuSearch,msVisualSearch',
        ].join(' ');

        exec(`"${edgePath}" ${edgeArgs}`, (error) => {
          if (error) {
            console.error('Ошибка запуска Edge:', error);
          }
        });
      } else if (existsSync(safariPath)) {
        // Запуск Safari (без киоск-режима, так как Safari не поддерживает флаги командной строки)
        exec(`open -a Safari "${url}"`, (error) => {
          if (error) {
            console.error('Ошибка запуска Safari:', error);
          } else {
            console.log('Safari открыт. Для полноэкранного режима нажмите Cmd+Ctrl+F');
          }
        });
      } else {
        console.log('Не найден ни Chrome, ни Edge, ни Safari. Откройте браузер вручную.');
        console.log(`URL: ${url}`);
      }
    } else {
      console.log('Автоматический запуск браузера доступен только на Windows и macOS');
      console.log(`Откройте браузер вручную: ${url}`);
    }
  }, 3000); // Ждем 3 секунды после запуска сервера
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${distPath}`);

  // Запускаем браузер автоматически (Windows и macOS)
  if (platform() === 'win32' || platform() === 'darwin') {
    launchBrowser();
  }
});
