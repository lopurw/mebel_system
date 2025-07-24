import React, { useState } from 'react'; 
import UsersTab from './UsersTab';
import CatalogTab from './CatalogTab';
import OrdersTab from './OrdersTab';
import StatisticsPanel from './StatisticsPanel'; // Импортируем компонент StatisticsTab
import classes from './AdminPanel.module.css';

import usersIcon from '../../../src/assets/icons/users.svg';
import catalogIcon from '../../../src/assets/icons/products.svg';
import ordersIcon from '../../../src/assets/icons/sales.svg';
import statisticsIcon from '../../../src/assets/icons/stat.svg';
import { height } from '@fortawesome/free-solid-svg-icons/fa0';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('users');
  const getIconColor = (tabName) => (activeTab === tabName ? '#ffffff' : '#00bfff');
  return (
    <div className={`container-fluid ${classes.adminPanel}`}>
  <div className="row">
    <div className="col-md-2">
      <ul className="nav flex-column nav-pills">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
            style={{
              color: activeTab === 'users' ? 'white' : 'black',
              backgroundColor: activeTab === 'users' ? '#007bff' : 'transparent', // Опционально: меняет фон активной кнопки
              display:'flex',
              alignItems:'center',
              gap:'10px'
            }}
          >
            <img src={usersIcon} alt="Пользователи" style={{ filter: activeTab === 'users' ? 'brightness(0) invert(1)' : '', height: '20px', width: '20px' }} />
            Пользователи
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
            style={{
              color: activeTab === 'catalog' ? 'white' : 'black',
              backgroundColor: activeTab === 'catalog' ? '#007bff' : 'transparent',
              display:'flex',
              alignItems:'center',
               gap:'10px'
            }}
          >
            <img src={catalogIcon} alt="Каталог" style={{ filter: activeTab === 'catalog' ? 'brightness(0) invert(1)' : '', height: '20px', width: '20px' }} />
            Каталог
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            style={{
              color: activeTab === 'orders' ? 'white' : 'black',
              backgroundColor: activeTab === 'orders' ? '#007bff' : 'transparent',
              display:'flex',
              alignItems:'center',
               gap:'10px'
            }}
          >
            <img src={ordersIcon} alt="Заказы" style={{ filter: activeTab === 'orders' ? 'brightness(0) invert(1)' : '', height: '20px', width: '20px' }} />
            Заказы
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => setActiveTab('statistics')}
            style={{
              color: activeTab === 'statistics' ? 'white' : 'black',
              backgroundColor: activeTab === 'statistics' ? '#007bff' : 'transparent',
              display:'flex',
              alignItems:'center',
               gap:'10px'
            }}
          >
            <img src={statisticsIcon} alt="Статистика" style={{ filter: activeTab === 'statistics' ? 'brightness(0) invert(1)' : '', height: '20px', width: '20px' }} />
            Статистика
          </button>
        </li>
      </ul>
    </div>

    <div className="col-md-10" style={{minHeight:'98vh', background:'rgb(238, 239, 243)'}}>
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'catalog' && <CatalogTab />}
      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'statistics' && <StatisticsPanel />}
    </div>
  </div>
</div>

  );
}

export default AdminPanel;


