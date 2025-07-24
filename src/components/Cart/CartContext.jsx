import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const clearCart=() =>{
    localStorage.clear();
  }


  // Загрузка корзины с сервера
  const updateCartFromDB = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCart(response.data); // Обновляем корзину из ответа сервера
      // Сохраняем в localStorage для дальнейшего использования
      localStorage.setItem("cart", JSON.stringify(response.data));
    } catch (error) {
      console.error("Ошибка при загрузке корзины:", error);
    }
  };

  // Загружаем данные корзины из localStorage
  const loadCartFromLocalStorage = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    if (savedCart) {
      setCart(savedCart); // Устанавливаем корзину из localStorage, если она существует
    } else {
      updateCartFromDB(); // Загружаем с сервера, если в localStorage пусто
    }
  };
  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  
  const addToCart = (product, quantity) => {
    const existingProductIndex = cart.findIndex((item) => item.id === product.id);
    if (existingProductIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingProductIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    // Обновляем localStorage
    localStorage.setItem("cart", JSON.stringify([...cart, { ...product, quantity }]));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    // Обновляем localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Загружаем корзину из localStorage при инициализации
  React.useEffect(() => {
    loadCartFromLocalStorage();
  }, []);

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart, removeFromCart, totalPrice, updateCartFromDB, getCartCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  return useContext(CartContext);
};
