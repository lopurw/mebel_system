import React, { useEffect } from 'react';
import ProductCard from './Card/ProductCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from './FavoritesProvider'; // Импортируем контекст
import classes from './Home.module.css';

const Favorites = () => {
  const { favorites, removeFromFavorites, fetchFavorites } = useFavorites(); // Получаем избранные товары и функцию удаления из контекста
  const navigate = useNavigate();
 

  useEffect(() => {
    // При необходимости можно добавить дополнительные эффекты
  }, []);
  useEffect(() => {
    // Обновляем избранное при каждом входе на страницу избранного
    fetchFavorites();
  }, [navigate.location]); // Перезапускаем при изменении маршрута
  // Проверяем, если данные еще загружаются
  if (!favorites) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={`container-fluid ${classes.aga1}`}>
      <div className="container">
        <h2 style={{ marginBottom: "20px", paddingTop:"20px" }}>Избранные товары</h2>
        <div className="row">
          {favorites.length > 0 ? (
            favorites.map((favorite) => (
              <div key={favorite.product_id} className="col-md-4">
                <div className="position-relative">
                  {/* Карточка товара */}
                  <ProductCard
                    id={favorite.product_id}
                    image={favorite.image}
                    title={favorite.title}
                    price={favorite.price}
                    product={favorite}
                  />
                  {/* Кнопка для удаления товара из избранного */}
                  <button
                    className="btn btn-danger position-absolute top-0 end-0 m-2"
                    onClick={() => removeFromFavorites(favorite.product_id)} // Удаляем товар при нажатии кнопки
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div>У вас нет избранных товаров.</div> // Если избранных товаров нет
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
