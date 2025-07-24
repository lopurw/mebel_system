// Notification.js
import React, { useEffect, useState } from 'react';
import classes from './Notification.module.css';

const Notification = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2000); // Через 2 секунды добавляем класс выхода
    const exitTimer = setTimeout(onClose, 2500); // Через 2.5 секунды вызываем onClose для удаления
    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer);
    };
  }, [onClose]);

  return (
    <div className={`${classes.notification} ${!visible ? classes.notificationExit : ''}`}>
      {message}
    </div>
  );
};

export default Notification;
