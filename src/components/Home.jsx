import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import ProductCard from "./Card/ProductCard"; // Импортируем компонент карточки товара
import { Link } from "react-router-dom";
import classes from './Home.module.css';
import '../App.css';
import Footer from "../../Footer";
import { width } from "@fortawesome/free-solid-svg-icons/fa0";

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/products")
      .then((response) => {
        // Сохраняем только последние 3 товара
        setProducts(response.data.slice(-3));
      })
      .catch((error) => {
        console.error("Ошибка при получении данных:", error);
      });
  }, []);
  return (
    <>
      <div className={classes.mainBackground}>
      {/* Секция с фоном и призывом к действию */}
      <section className={`hero-section d-flex align-items-center justify-content-center ${classes.heroSection}`}>
        <div className="text-center">
          <h1 className={`display-3 ${classes.heroTitle}`}>
            Красивая и качественная мебель вместе с Meb.by
          </h1>
          <p className={`lead ${classes.heroSubtitle}`}>
            Инвестируйте в комфорт и стиль для вашего дома.
          </p>
          <Link to="/catalog" className={`btn btn-lg ${classes.ctaButton}`}>
            Купить сейчас
          </Link>
        </div>
      </section>

      {/* Описание: Почему выбирать качественную мебель */}
      <section className={`container my-5 py-5 ${classes.descriptionSection}`}>
        <div className="row justify-content-center text-center">
          <div className="col-lg-8">
            <h2 className={`display-4 ${classes.sectionTitle}`}>
              Почему стоит выбрать качественную мебель?
            </h2>
            <p className={`lead ${classes.sectionText}`}>
              Качественная мебель — это не просто удобство, но и долгосрочное вложение. Она поддерживает ваш комфорт, улучшает внешний вид интерьера и служит вам долгие годы. Сделайте выбор в пользу надежности и эстетики.
            </p>
          </div>
        </div>
      </section>

      {/* Секция с улучшенными карточками: Почему стоит выбрать нас */}
      <section className={`container my-5 ${classes.cardSection}`}>
        <div className="row">
          {/* Карточка 1 */}
          <div className="col-md-4 mb-4">
            <div className={`card h-100 text-center shadow-lg border-0 ${classes.card}`}>
              <div className="card-body">
                <h5 className={`card-title ${classes.cardTitle}`}>
                  Высокое качество
                </h5>
                <p className={`card-text ${classes.cardText}`}>
                  Мы используем только лучшие материалы для создания мебели, которая будет служить вам долгие годы.
                </p>
              </div>
            </div>
          </div>

          {/* Карточка 2 */}
          <div className="col-md-4 mb-4">
            <div className={`card h-100 text-center shadow-lg border-0 ${classes.card}`}>
              <div className="card-body">
                <h5 className={`card-title ${classes.cardTitle}`}>
                  Современный дизайн
                </h5>
                <p className={`card-text ${classes.cardText}`}>
                  Наши коллекции созданы с учётом последних тенденций в дизайне интерьера.
                </p>
              </div>
            </div>
          </div>

          {/* Карточка 3 */}
          <div className="col-md-4 mb-4">
            <div className={`card h-100 text-center shadow-lg border-0 ${classes.card}`}>
              <div className="card-body">
                <h5 className={`card-title ${classes.cardTitle}`}>
                  Доступные цены
                </h5>
                <p className={`card-text ${classes.cardText}`}>
                  Мы предлагаем качественную мебель по разумной цене, чтобы каждый мог создать уютный дом.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Секция с последними товарами */}
      <section className={`container my-5 ${classes.latestProductsSection}`}>
        <h2 className={`text-center mb-4 ${classes.sectionTitle}`}>
          Новинки
        </h2>
        <div className="row">
         
          {products.map((product) => (
            <div className={`col-md-4 mb-4 ${classes.card_latest}`} key={product.id}>
               <div>
              <ProductCard
                id={product.id}
                image={product.image}
                title={product.title}
                price={product.price}
                product={product}
                // style={{width:'100%  !important'}}
              />
              </div>
            </div>
          ))}
          
        </div>
        {/* Кнопка для перехода в полный каталог */}
        <div className="text-center">
          <Link to="/catalog" className={`btn btn-primary ${classes.catalogButton}`}>
            Посмотреть весь каталог
          </Link>
        </div>
      </section>
      <Footer></Footer>
    </div>
    </>
  );
};

export default Home;
