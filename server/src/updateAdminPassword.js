const { db } = require('./config/db');
const bcrypt = require('bcryptjs');

const updatePassword = async () => {
  try {
    // Хешируем пароль
    const password = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Generated hash:', hashedPassword);
    
    // Обновляем пароль администратора
    db.run('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@example.com'], function(err) {
      if (err) {
        console.error('Error updating password:', err);
        process.exit(1);
      } else {
        console.log(`Password updated for ${this.changes} users`);
        
        // Проверяем, что пароль работает
        db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com'], async (err, user) => {
          if (err) {
            console.error('Error fetching user:', err);
            process.exit(1);
          }
          
          if (!user) {
            console.error('Admin user not found!');
            process.exit(1);
          }
          
          const isMatch = await bcrypt.compare(password, user.password);
          console.log('Password verification test:', isMatch ? 'SUCCESS' : 'FAILED');
          
          process.exit(0);
        });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Запускаем обновление
updatePassword(); 