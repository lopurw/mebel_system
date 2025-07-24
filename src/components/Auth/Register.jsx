import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';

import classes from './RegAndLog.module.css'

const Register = ({ toggleForm }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message); // Success message
            } else {
                alert(data.error); // Error message
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    };
    

    return (
        <div className={classes.aga}>
        <div className={`container d-flex  align-items-center ${classes.container}`} style={{ flexDirection: 'column', gap: '20px', height: 'calc(100vh - 86px)' }}>
        <div className={`shadow-lg rounded p-4 border-light ${classes.login_card}`}>
            <h2 className={`text-center text-white ${classes.title}`}>Регистрация</h2>
            <form onSubmit={handleRegister} className={classes.form}>
              <div className={`mb-3 ${classes.inputContainer}`}>
                <label htmlFor="username" className={`form-label text-white ${classes.label}`}>
                  Имя пользователя
                </label>
                <input
                  type="text"
                  className={`form-control border-light text-white bg-transparent ${classes.input}`}
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className={`mb-3 ${classes.inputContainer}`}>
                <label htmlFor="email" className={`form-label text-white ${classes.label}`}>
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
                <label htmlFor="password" className={`form-label text-white ${classes.label}`}>
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
              <button type="submit" className={`btn w-100 btn-primary ${classes.button}`} >
                Зарегистрироваться
              </button>
            </form>
          </div>
          <div className={`shadow-lg rounded p-4 border-light ${classes.login_card}`}  style={{ height: '9vh' }}>

            <p className={` text-white ${classes.text}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
              Есть аккаунт? 
              <Link to="/login" className={` ${classes.link}`} style={{ color: 'rgb(13, 110, 253)' }}> Войти</Link>
            </p>
            </div>
        </div>
      </div>
    );
  };
  
  export default Register;