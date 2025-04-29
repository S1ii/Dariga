const { exec } = require('child_process');
const path = require('path');
const setupLogTables = require('./setup-logs');

console.log('Запуск настройки системы логирования...');

// Выполняем настройку логов напрямую через функцию
setupLogTables()
  .then(success => {
    if (success) {
      console.log('Настройка системы логирования завершена успешно');
      
      // Перезапускаем сервер
      console.log('Перезапуск сервера...');
      exec('npm run dev', (error, stdout, stderr) => {
        if (error) {
          console.error('Ошибка при перезапуске сервера:', error);
          process.exit(1);
        }
        
        console.log('Сервер успешно перезапущен');
        console.log(stdout);
        
        if (stderr) {
          console.error('Предупреждения при перезапуске:', stderr);
        }
      });
    } else {
      console.error('Настройка системы логирования завершилась с ошибками');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Неожиданная ошибка при настройке системы логирования:', err);
    process.exit(1);
  }); 