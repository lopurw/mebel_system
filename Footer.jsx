import React from 'react';
import { Link } from 'react-router-dom';
import classes from './Footer.module.css'; // Импортируем стили из модуля

const Footer = () => {
  return (
    <footer className={classes.footer}>
      <div className="container">
        <div className="row">
          <div className="col-md-4 text-center">
            <h5 className={classes.footerTitle}>Meb.by</h5>
            <p className={classes.footerDescription}>
              Meb.by - мебель, которая придаст уют вашему дому.
            </p>
          </div>
          <div className="col-md-4 text-center">
            <h5 className={classes.footerTitle}>Навигация</h5>
            <ul className={classes.footerLinks}>
              <li>
                <Link to="/" className={classes.footerLink}>Главная</Link>
              </li>
              <li>
                <Link to="/catalog" className={classes.footerLink}>Каталог</Link>
              </li>
              <li>
                <Link to="/about" className={classes.footerLink}>О нас</Link>
              </li>
            </ul>
          </div>
          <div className="col-md-4 text-center">
            <h5 className={classes.footerTitle}>Контакты</h5>
            <ul className={classes.footerContact}>
              <li>
                <i className="bi bi-envelope-fill"></i> info@meb.by
              </li>
              <li>
                <i className="bi bi-telephone-fill"></i> +375 29 123 45 67
              </li>
            </ul>
            <div className={classes.footerSocial}>
              <a href="#" className={classes.socialLink}>
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className={classes.socialLink}>
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className={classes.socialLink}>
                <i className="bi bi-twitter"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="row mt-4">
          <div className="col text-center">
            <p className={classes.footerCopy}>&copy; {new Date().getFullYear()} Meb.by. Все права защищены.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
