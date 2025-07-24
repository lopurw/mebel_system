
import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useCart } from "../Cart/CartContext";
import { useAuth } from "../Auth/AuthContext"; 
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css"; 
import axios from "axios";
import classes from './ProductDetail.module.css';
import Footer from "../../../Footer";
import Notification from "../../Notification";
import { useFavorites } from "../FavoritesProvider";

const ProductDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const product = location.state?.product;
  const { addToCart } = useCart();
  const { username } = useAuth(); 
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites(); // Подключаем методы контекста избранного
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false); // Стейт для отслеживания избранного
  const [notification, setNotification] = useState(""); // Для уведомлений
 // Прокрутка в верхнюю часть страницы при монтировании компонента
 useEffect(() => {
  window.scrollTo(0, 0);
}, []);
useEffect(() => {
  if (product) {
    setIsFavorite(favorites.some(fav => fav.product_id === product.id));
  }
}, [favorites, product]);
  // Получение данных о статусе "избранное" при монтировании компонента
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const token = localStorage.getItem('token');
      if (token && product) {
        try {
          const response = await axios.get(`http://localhost:5000/api/favorites/check/${product.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data.isFavorite) {
            setIsFavorite(true); // Устанавливаем статус избранного
          }
        } catch (error) {
          console.error("Ошибка при проверке избранного статуса:", error);
        }
      }
    };
    fetchFavoriteStatus();
  }, [product]);

  const incrementQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prevQuantity) => prevQuantity - 1);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNotification("Для добавления товара в корзину необходимо авторизоваться");
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:5000/api/cart/add',
        {
          product_id: product.id,
          quantity: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        addToCart(product, quantity);
        setNotification("Товар добавлен в корзину");
      }
    } catch (error) {
      console.error("Ошибка при добавлении товара в корзину:", error);
    }
  };
  

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setNotification("Для добавления товара в избранное необходимо авторизоваться");
      return;
    }
  
    if (isFavorite) {
      await removeFromFavorites(product.id);
      setIsFavorite(false);
      setNotification("Товар удален из избранного");
    } else {
      await addToFavorites(product.id);
      setIsFavorite(true);
      setNotification("Товар добавлен в избранное");
    }
  };
  

  if (!product) {
    return <p>Товар не найден</p>;
  }

  return (
    <>
      <div className={classes.productDetail}>
        <div className={`container d-flex flex-column align-items-center ${classes.container}`} style={{ justifyContent: 'center', alignItems: 'center', height: '100%'}}>
          <div className="row w-100">
            <div className={`col-md-6 text-center d-flex justify-content-center align-items-center ${classes.imageContainer}`}>
              <img
                src={product.image}
                alt={product.title}
                className={`img-fluid ${classes.productImage}`}
              />
            </div>
            <div className="col-md-6 d-flex flex-column justify-content-center">
              <h2 className={`display-4 ${classes.productTitle}`}>{product.title}</h2>
              <p className={`h4 ${classes.productPrice}`}>
                Цена: <strong>{product.price} BYN</strong>
              </p>
              <p className={classes.productDescription} style={{ color: '#FFF' }}>
                {product.description || "Описание отсутствует"}
              </p>
              <p className={classes.productInfo}>
                <strong>Цвет:</strong> {product.color || "Не указан"}<br />
                <strong>Бренд:</strong> {product.brand || "Не указан"}<br />
                <strong>Страна производства:</strong> {product.country || "Не указана"}
              </p>
              <div className={`d-flex align-items-center my-4 ${classes.quantityControl}`} style={{ marginTop: '100px' }}>
                <button className={`btn btn-outline-light ${classes.quantityButton}`} onClick={decrementQuantity}>-</button>
                <span className={`mx-4 ${classes.quantityText}`} style={{ color: '#FFF' }}>{quantity}</span>
                <button className={`btn btn-outline-light ${classes.quantityButton}`} onClick={incrementQuantity}>+</button>
                <i
                  className={`bi bi-heart${isFavorite ? "-fill" : ""} ${classes.favoriteIcon} ms-3`}
                  onClick={handleToggleFavorite}
                  style={{
                    fontSize: "2rem",
                    color: isFavorite ? "red" : "white",
                    cursor: "pointer",
                  }}
                />
              </div>
              {product.quantity_pr <= 0 ? (
                <p className="text-danger" style={{fontSize: '20px'}}>Нет в наличии</p>
              ) : (
                <button
                  className={`btn btn-lg ${classes.addToCartButton}`}
                  onClick={handleAddToCart}
                >
                  В корзину
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {notification && <Notification message={notification} onClose={() => setNotification("")} />}
    
  
    </>
  );
};

export default ProductDetail;

