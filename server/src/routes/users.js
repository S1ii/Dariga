const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Заглушки для контроллеров, которые нужно будет реализовать
const getProfile = (req, res) => {
  try {
    // Гарантируем, что дата регистрации существует и имеет корректный формат
    let createdAt;
    
    if (req.user.created_at) {
      try {
        // Пробуем преобразовать дату
        const date = new Date(req.user.created_at);
        if (!isNaN(date.getTime())) {
          createdAt = date.toISOString();
        } else {
          // Если преобразование не удалось, используем текущую дату
          createdAt = new Date().toISOString();
        }
      } catch (e) {
        console.error('Ошибка преобразования даты:', e);
        createdAt = new Date().toISOString();
      }
    } else {
      // Если даты нет, используем текущую
      createdAt = new Date().toISOString();
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: createdAt
      }
    });
  } catch (err) {
    console.error('Error in getProfile:', err);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    // Получаем данные из запроса
    const { name, email } = req.body;
    
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать хотя бы одно поле для обновления'
      });
    }

    // Создаем SQL запрос для обновления
    let sql = 'UPDATE users SET ';
    const updateFields = [];
    const values = [];

    if (name) {
      updateFields.push('name = ?');
      values.push(name);
    }
    
    if (email) {
      updateFields.push('email = ?');
      values.push(email);
    }

    sql += updateFields.join(', ');
    sql += ' WHERE id = ?';
    values.push(req.user.id);

    // Выполняем запрос к базе данных
    const { db } = require('../config/db');
    db.run(sql, values, function(err) {
      if (err) {
        console.error('Error updating profile:', err);
        return res.status(500).json({
          success: false,
          message: 'Ошибка при обновлении профиля'
        });
      }

      // Если успешно, возвращаем обновленные данные
      res.status(200).json({
        success: true,
        data: {
          ...req.user,
          name: name || req.user.name,
          email: email || req.user.email
        },
        message: 'Профиль успешно обновлен'
      });
    });
  } catch (err) {
    console.error('Error in updateProfile:', err);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Проверка на наличие обязательных полей
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Необходимо указать текущий и новый пароль'
      });
    }

    // Получаем текущий хэш пароля пользователя из базы данных
    const { db } = require('../config/db');
    const bcrypt = require('bcryptjs');

    const getUserQuery = 'SELECT password FROM users WHERE id = ?';
    
    db.get(getUserQuery, [req.user.id], async (err, user) => {
      if (err) {
        console.error('Error fetching user:', err);
        return res.status(500).json({
          success: false,
          message: 'Ошибка сервера'
        });
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Пользователь не найден'
        });
      }

      // Проверяем совпадение текущего пароля
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Неверный текущий пароль'
        });
      }

      // Хэшируем новый пароль
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Обновляем пароль в базе данных
      const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
      
      db.run(updateQuery, [hashedPassword, req.user.id], (updateErr) => {
        if (updateErr) {
          console.error('Error updating password:', updateErr);
          return res.status(500).json({
            success: false,
            message: 'Ошибка при обновлении пароля'
          });
        }

        res.status(200).json({
          success: true,
          message: 'Пароль успешно изменен'
        });
      });
    });
  } catch (err) {
    console.error('Error in changePassword:', err);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
};

// Маршруты
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router; 