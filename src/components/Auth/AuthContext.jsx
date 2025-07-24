import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null); // Состояние для роли

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUsername = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role"); // Получаем роль из localStorage
    if (token && storedUsername && storedRole) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setRole(storedRole); // Устанавливаем роль
    }
  }, []);
  

  const login = (token, username, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role); // Сохраняем роль в localStorage
    setIsLoggedIn(true);
    setUsername(username);
    setRole(role); // Устанавливаем роль в состояние
  };
  

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role"); // Удаляем роль из localStorage
    setIsLoggedIn(false);
    setUsername(null);
    setRole(null); // Сбрасываем роль
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
