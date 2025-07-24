// src/components/Logout.js
import classes from './RegAndLog.module.css'
import React from "react";
import { useAuth } from "./AuthContext"; // Импортируем контекст аутентификации
import { useNavigate } from "react-router-dom";
import { useCart } from '../Cart/CartContext';

const Logout = () => {
  const { logout } = useAuth(); // Получаем функцию logout из контекста
  const navigate = useNavigate();
  const {clearCart} = useCart();

  const handleLogout = () => {
    logout(); // Очищаем токен, пользователя и роль
    navigate("/login"); // Перенаправляем на страницу входа
    clearCart();
  };

  return (
    <button onClick={handleLogout}>
      <i className="bi bi-box-arrow-right m-0" style={{ fontSize: "1.5rem"}}></i> 
    </button>
  );
};

export default Logout;
