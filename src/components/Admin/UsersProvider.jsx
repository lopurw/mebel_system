// UsersContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetching the list of admins
  const fetchAdmins = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:5000/api/admins', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAdmins(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Adding an admin
  const addAdmin = async (newAdmin) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/admins/add', newAdmin, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAdmins(); // Refresh the list of admins
    } catch (err) {
      setError(err.message);
    }
  };

  // Editing an admin
  const editAdmin = async (id, updatedAdmin) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/admins/edit/${id}`, updatedAdmin, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAdmins(); // Refresh the list of admins
    } catch (err) {
      setError(err.message);
    }
  };

  // Deleting an admin
  const deleteAdmin = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/admins/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAdmins(); // Refresh the list of admins
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <UsersContext.Provider value={{ admins, loading, error, addAdmin, editAdmin, deleteAdmin }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => {
  return useContext(UsersContext);
};
