// AboutUs.js
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import MinskMap from './MinskMap';
import classes from '../components/About.module.css'
import Footer from '../../Footer';

const About = () => {
  return (
    <div>
    <div className={classes.container}>
    {/* Левый блок с картой */}
    <div className={classes.mapWrapper}>
      <MinskMap />
    </div>
    
    {/* Правый блок с информацией */}
    <div className={classes.infoSection}>
      <h2 className={classes.header}>О нас</h2>
      <p className={classes.paragraph}>
        Добро пожаловать в интернет-магазин мебели Meb.by! Мы предлагаем широкий ассортимент качественной и
        стильной мебели для вашего дома и офиса. Наша цель – помочь вам создать уютное и функциональное
        пространство, которое будет отражать ваш стиль и удовлетворять все потребности.
      </p>
      <p className={classes.paragraph}>
        Мы ценим наших клиентов и стремимся предоставлять лучшие товары по конкурентоспособным ценам.
        Наша команда всегда готова помочь вам с выбором, а также предложить быструю и безопасную доставку.
      </p>

      <div className={classes.card}>
        <div className={classes.cardBody}>
          <h5 className={classes.header}>Контактная информация</h5>
          <p className={classes.cardBodyText}><strong>Юридический адрес:</strong> г. Минск, ул. Примерная, 10, офис 15</p>
          <p className={classes.cardBodyText}><strong>Телефон:</strong> +375 (29) 123-45-67</p>
          <p className={classes.cardBodyText}><strong>Email:</strong> info@meb.by</p>
          <p className={classes.cardBodyText}><strong>Время работы:</strong> Пн-Пт 9:00 - 18:00</p>
        </div>
      </div>
    </div>
   
  </div>
  <Footer></Footer>
  </div>
);
};
  
  export default About;
