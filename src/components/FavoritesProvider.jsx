// FavoritesProvider.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/favorites', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setFavorites(response.data);
  };

  const addToFavorites = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:5000/api/favorites/add',
        { product_id: productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFavorites((prevFavorites) => [...prevFavorites, { product_id: productId }]);
    } catch (error) {
      console.error('Ошибка при добавлении в избранное', error);
    }
  };

  const removeFromFavorites = async (productId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/favorites/remove/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFavorites((prevFavorites) => 
        prevFavorites.filter(favorite => favorite.product_id !== productId)
      );
    } catch (error) {
      console.error('Ошибка при удалении из избранного', error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <FavoritesContext.Provider value={{ favorites, fetchFavorites, addToFavorites, removeFromFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  return useContext(FavoritesContext);
};
