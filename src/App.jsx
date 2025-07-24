// src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/Auth/AuthContext"; // Импортируем провайдер аутентификации
import ProductList from "./components/Card/ProductList";
import ProductDetail from "./components/Card/ProductDetail";
import NavBar from "./components/NavBar";
import Home from "./components/Home";
import About from "./components/About";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { CartProvider } from "./components/Cart/CartContext"; // Импортируем провайдер корзины
import Cart from "./components/Cart/Cart"; // Импортируем компонент корзины
import PrivateRoute from "./components/Auth/PrivateRoute"; // защищённые маршруты
import AdminPanel from "./components/Admin/AdminPanel";
import Footer from "../Footer";
import Favorites from "./components/Favorites";
import { FavoritesProvider } from './components/FavoritesProvider'; // Импорти
import { UsersProvider } from "./components/Admin/UsersProvider";



const App = () => {
  // localStorage.clear();


  return (
    <AuthProvider>
      <CartProvider>
      <FavoritesProvider>
      <UsersProvider>
        <Router>
          <NavBar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/cart" element={<Cart />} />{" "}
            <Route path="/fav" element={<Favorites />} />{" "}
            {/* Добавляем маршрут для корзины */}
            {/* Защищённые маршруты */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
          </Routes>
         
        </Router>
        </UsersProvider>
        </FavoritesProvider>
        
      </CartProvider>
    </AuthProvider>
   
  );
};

export default App;
