import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import classes from "./RegAndLog.module.css";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
  
      console.log(response.data); // Добавьте эту строку для отладки
  
      if (response.data.success) {
        login(response.data.token, response.data.user.username, response.data.user.role); // Передаем роль
        navigate("/"); 
      } else {
        setError("Неверные email или пароль");
      }
    } catch (err) {
      console.error("Ошибка при входе:", err);
      setError("Ошибка сервера");
    }
  };
  
  
  
  

  return (
    <div className={`${classes.aga} ${classes.login_page}`}>
      <div
        className={`container d-flex justify-content-center align-items-center${classes.container}`}
        style={{ flexDirection: 'column', gap: '20px', margin: 'auto', alignItems: 'center' }}
      >
        <div
          className={`shadow-lg rounded p-4 border-light ${classes.login_card}`}
        >
          <h2 className={`text-center text-white ${classes.title}`}>Вход</h2>
          <form onSubmit={handleLogin} className={`mb-10 ${classes.form}`}>
            <div className={`mb-3 ${classes.inputContainer}`}>
              <label
                htmlFor="email"
                className={`form-label text-white ${classes.label}`}
              >
                Email
              </label>
              <input
                type="email"
                className={`form-control border-light text-white bg-transparent ${classes.input}`}
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className={`mb-3 ${classes.inputContainer}`}>
              <label
                htmlFor="password"
                className={`form-label text-white ${classes.label}`}
              >
                Пароль
              </label>
              <input
                type="password"
                className={`form-control border-light text-white bg-transparent ${classes.input}`}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-danger">{error}</p>}
            <button
              type="submit"
              className={`btn btn-primary w-100 ${classes.button}`}
            >
              Войти
            </button>
          </form>
        </div>
            <div className={`shadow-lg rounded p-4 border-light ${classes.login_card}`}
            style={{ display: 'flex', justifyContent: 'space-between', color: '#FFF'}}
            >
              <span style={{color: '#FFF' }}>Впервые на сайте?</span>
              <Link to="/register" className={` ${classes.link}`} style={{color: '#0d6efd' }}>
                {" "}
                Регистрация
              </Link>
            </div>
      </div>
    </div>
  );
};

export default Login;
