import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "./Auth/AuthContext"; // Импортируем контекст аутентификации
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import LogOut from "./Auth/LogOut"; // Компонент выхода
import { useCart } from "./Cart/CartContext"; // Импортируем контекст корзины
import "./NavBar.css";
import { useFavorites } from "./FavoritesProvider"; 

const NavBar = () => {

   // Добавьте это в компонент NavBar
  const { cart, getCartCount } = useCart(); // Получаем данные корзины и количество
  const { favorites } = useFavorites(); // Получаем данные избранного

  const cartCount = getCartCount(); // Получаем количество товаров в корзине
  const favoriteCount = favorites.length; // Получаем количество избранных товаров
  const { isLoggedIn, username, role } = useAuth(); 
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light navbar1">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Meb.by
        </Link>
        <div
          className="collapse navbar-collapse justify-content-center"
          id="navbarNav"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <NavLink
                exact
                to="/"
                className="nav-link"
                activeClassName="active"
              >
                Главная
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/catalog"
                className="nav-link"
                activeClassName="active"
              >
                Каталог
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/about"
                className="nav-link"
                activeClassName="active"
              >
                О нас
              </NavLink>
            </li>
            {role === "admin" && ( // Проверяем, если роль admin
              <li className="nav-item">
                <NavLink
                  to="/admin"
                  className="nav-link"
                  activeClassName="active"
                >
                  Для админа
                </NavLink>
              </li>
            )}
          </ul>
        </div>
        <div className="d-flex align-items-center">
          <div className="position-relative me-3">
          <NavLink
              to="/fav"
              className="nav-link"
              style={{ color: "#2d3d54" }}
              
            >
            <i
              className="bi bi-heart"
              style={{ fontSize: "1.5rem", color: "#2d3d54" }}
            ></i>
            {favoriteCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {favoriteCount}
              </span>
            )}
            </NavLink>
          </div>

          <div className="position-relative me-3">
            
            <NavLink
              to="/cart"
              className="nav-link"
              style={{ color: "#2d3d54" }}
              activeClassName="active"
            >
              <i
              className="bi bi-cart"
              style={{ fontSize: "1.5rem", color: "#2d3d54" }}
            ></i>
         
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
                
              )}
            </NavLink>
          </div>

          <div className="d-flex align-items-center ms-3">
            {isLoggedIn ? (
              <div className="position-relative d-flex ">
                <h4  style={{ cursor: "pointer", alignSelf:'center' }} className="mb-0">
                  {username}
                </h4>
                <LogOut />
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline-primary">
                Войти
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
