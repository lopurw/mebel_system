import React, { useEffect, useState } from 'react';
import axios from 'axios';
import classes from './OrdersTab.module.css';

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState({}); // Хранит статус для редактирования
  const [selectedStatus, setSelectedStatus] = useState(''); // Статус для фильтрации

  // Функция для загрузки заказов с учетом выбранного фильтра
  const fetchOrders = async (statusFilter = '') => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        params: { status: statusFilter }
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders(selectedStatus); // Загружаем заказы при изменении фильтра
  }, [selectedStatus]);

  const handleStatusChange = async (orderId) => {
    try {
      const newStatus = status[orderId]; // Новый статус для этого заказа
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus });
      alert('Статус обновлен');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleFilterChange = (statusFilter) => {
    setSelectedStatus(statusFilter); // Обновляем фильтр и перезагружаем заказы
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div>
     
      
      {/* Фильтрация */}
      <div className={classes.filterButtons} style={{marginTop:'20px'}}>
        {/* Кнопки фильтрации */}
        {['', 'оформлен', 'одобрен', 'собран', 'в пути', 'завершен'].map((statusFilter) => (
          <button
            key={statusFilter}
            onClick={() => handleFilterChange(statusFilter)}
            className={`${classes.filterButton} ${selectedStatus === statusFilter ? classes.active : ''}`}
          >
            {statusFilter ? statusFilter : 'Все'}
          </button>
        ))}
      </div>
      
      <table className={classes.table}>
        <thead>
          <tr>
            <th className={classes.tableHeader}>Имя</th>
            <th className={classes.tableHeader}>Фамилия</th>
            <th className={classes.tableHeader}>Телефон</th>
            <th className={classes.tableHeader}>Улица</th>
            <th className={classes.tableHeader}>Дом</th>
            <th className={classes.tableHeader}>Квартира</th>
            <th className={classes.tableHeader}>Этаж</th>
            <th className={classes.tableHeader}>Дата заказа</th>
            <th className={classes.tableHeader}>Товары</th>
            <th className={classes.tableHeader}>Общая стоимость</th>
     
            <th className={classes.tableHeader}>Изменить статус</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr
              key={index}
              className={`${index % 2 === 0 ? classes.evenRow : ''} ${classes.rowHover}`}
            >
              <td className={classes.tableCell}>{order.first_name}</td>
              <td className={classes.tableCell}>{order.last_name}</td>
              <td className={classes.tableCell}>{order.phone}</td>
              <td className={classes.tableCell}>{order.street}</td>
              <td className={classes.tableCell}>{order.house}</td>
              <td className={classes.tableCell}>{order.apartment}</td>
              <td className={classes.tableCell}>{order.floor}</td>
              <td className={classes.tableCell}>{new Date(order.order_date).toLocaleDateString()}</td>
              <td className={classes.tableCell}>
                {order.items.map(item => (
                  <div key={item.product_id} className={classes.item}>
                    {item.quantity} x {item.title} ({item.price} BYN)
                  </div>
                ))}
              </td>
              <td className={classes.tableCell}>{calculateTotal(order.items)}₽</td>
             
              <td className={classes.tableCell}>
                <select
                  value={status[order.order_id] || order.status}
                  onChange={(e) => setStatus({ ...status, [order.order_id]: e.target.value })}
                >
                  <option value="оформлен">Оформлен</option>
                  <option value="одобрен">Одобрен</option>
                  <option value="собран">Собран</option>
                  <option value="в пути">В пути</option>
                  <option value="завершен">Завершен</option> {/* Добавлен новый статус */}
                </select>
                <button
                  onClick={() => handleStatusChange(order.order_id)}
                  className="btn btn-primary"
                >
                  Обновить
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTab;
