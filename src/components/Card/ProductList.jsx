import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import classes from "./ProductList.module.css";
import Footer from "../../../Footer";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Set the number of items per page
  // Фильтры
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [color, setColor] = useState([]);
  const [brand, setBrand] = useState([]);
  const [country, setCountry] = useState([]);
  const [size, setSize] = useState([]);
  const [category, setCategory] = useState("");

  // State for managing collapsible filter sections
  const [sizeOpen, setSizeOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const brandOptions = ["IKEA", "Ashley Furniture", "Wayfair", "Steelcase", "Herman Miller"];
  const countryOptions = ["Беларусь", "Россия", "Китай", "Польша", "Италия"];
  const colorOptions = [
    { name: "Красный", code: "#FF0000" },
    { name: "Зеленый", code: "#00FF00" },
    { name: "Синий", code: "#0000FF" },
    { name: "Желтый", code: "#FFFF00" },
    { name: "Черный", code: "#000000" },
    { name: "Белый", code: "#FFFFFF" },
  ];
  const sizeOptions = [
    { label: "до 50см", range: "0-50" },
    { label: "от 51 до 100см", range: "51-100" },
    { label: "от 101 до 200см", range: "101-200" },
    { label: "от 201 до 300см", range: "201-300" },
    { label: "от 301 до 400см", range: "301-400" },
    { label: "более 400см", range: "401-9999" },
  ];

  const categoryOptions = [
    { value: '1', label: 'Для гостинной' },
    { value: '2', label: 'Для ванной' },
    { value: '3', label: 'Для кухни' },
  ];

  // Прокрутка в верхнюю часть страницы при монтировании компонента
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/products", {
          params: {
            search: searchQuery,
            priceRange: priceRange.join(","),
            color: color.join(","),
            brand: brand.join(","),
            country: country.join(","),
            size: size.join(","),
            category,
          },
        });
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error("Ошибка при получении данных:", error);
      }
    };

    fetchProducts();
  }, [searchQuery, priceRange, color, brand, country, size, category]);

  useEffect(() => {
    const results = products.filter(
      (product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        product.price >= priceRange[0] &&
        product.price <= priceRange[1] &&
        (color.length ? color.includes(product.color) : true) &&
        (brand.length ? brand.includes(product.brand) : true) &&
        (country.length ? country.includes(product.country) : true) &&
        (size.length ? size.some((range) => {
          const [min, max] = range.split("-").map(Number);
          return product.size >= min && product.size <= max;
        }) : true) &&
        (category ? product.category_id == category : true)
    );
    setFilteredProducts(results);
  }, [searchQuery, priceRange, color, brand, country, size, category, products]);

  const toggleSelection = (setter) => (value) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleMinPriceChange = (e) => {
    const newMinPrice = Math.min(+e.target.value, priceRange[1]);
    setPriceRange([newMinPrice, priceRange[1]]);
  };

  const handleMaxPriceChange = (e) => {
    const newMaxPrice = Math.max(+e.target.value, priceRange[0]);
    setPriceRange([priceRange[0], newMaxPrice]);
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0); // Прокрутка к началу страницы при изменении страницы
  };

  // Сбросить все фильтры
  const resetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 1000]);
    setColor([]);
    setBrand([]);
    setCountry([]);
    setSize([]);
    setCategory("");
    setCurrentPage(1); // Сбросить на первую страницу
    window.scrollTo(0, 0); // Прокрутка к верху
  };

  return (
    <div className={classes.aga}>
      <div className="container">
        <input
          type="text"
          placeholder="Поиск товара..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`form-control mb-3 ${classes.search_bar}`}
        />
      </div>
      <div className={`container-fluid justify-content-center d-flex ${classes.ava}`}>
        <div className="row justify-content-center col-12">
          <div
            className={`col-2 ${classes.filters}`}
            style={{
              height: "fit-content",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              padding: "20px",
              borderRadius: "15px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
            }}
          >
            <h4 style={{ color: "#002559" }}>Фильтры</h4>

            {/* Price Filter */}
            <div className={classes.filter_group}>
              <h6 style={{ color: "#002559" }}>Цена</h6>
              <div className="d-flex align-items-center mb-2">
                <span style={{ color: "#333", marginRight: "10px" }}>От:</span>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={handleMinPriceChange}
                  min="0"
                  max="1000"
                  placeholder="0"
                  className={`form-control ${classes.inputField}`}
                  style={{ maxWidth: "80px", marginRight: "10px", padding: "0" }}
                />
                <span style={{ color: "#333", margin: "0 10px" }}>До:</span>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={handleMaxPriceChange}
                  min="0"
                  max="1000"
                  placeholder="100"
                  className={`form-control ${classes.inputField}`}
                  style={{ maxWidth: "80px" }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                className={`form-range ${classes.range}`}
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                className={`form-range ${classes.range}`}
              />
            </div>

            {/* Size Filter */}
            <div className="mt-3">
              <h6
                style={{ color: "#002559", cursor: "pointer" }}
                onClick={() => setSizeOpen(!sizeOpen)}
              >
                Размер
              </h6>
              {sizeOpen && (
                <div>
                  {sizeOptions.map(({ label, range }) => (
                    <div key={range} className="form-check">
                      <input
                        type="checkbox"
                        checked={size.includes(range)}
                        onChange={() => toggleSelection(setSize)(range)}
                        className="form-check-input"
                      />
                      <label className="form-check-label" style={{ color: "#333" }}>
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Brand Filter */}
            <div className="mt-3">
              <h6
                style={{ color: "#002559", cursor: "pointer" }}
                onClick={() => setBrandOpen(!brandOpen)}
              >
                Бренд
              </h6>
              {brandOpen && (
                <div>
                  {brandOptions.map((option) => (
                    <div key={option} className="form-check">
                      <input
                        type="checkbox"
                        checked={brand.includes(option)}
                        onChange={() => toggleSelection(setBrand)(option)}
                        className="form-check-input"
                      />
                      <label className="form-check-label" style={{ color: "#333" }}>
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Country Filter */}
            <div className="mt-3">
              <h6
                style={{ color: "#002559", cursor: "pointer" }}
                onClick={() => setCountryOpen(!countryOpen)}
              >
                Страна производства
              </h6>
              {countryOpen && (
                <div>
                  {countryOptions.map((option) => (
                    <div key={option} className="form-check">
                      <input
                        type="checkbox"
                        checked={country.includes(option)}
                        onChange={() => toggleSelection(setCountry)(option)}
                        className="form-check-input"
                      />
                      <label className="form-check-label" style={{ color: "#333" }}>
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Color Filter */}
            <div className="mt-3">
              <h6
                style={{ color: "#002559", cursor: "pointer" }}
                onClick={() => setColorOpen(!colorOpen)}
              >
                Цвет
              </h6>
              {colorOpen && (
                <div>
                  {colorOptions.map(({ name }) => (
                    <div key={name} className="form-check">
                      <input
                        type="checkbox"
                        checked={color.includes(name)}
                        onChange={() => toggleSelection(setColor)(name)}
                        className="form-check-input"
                      />
                      <label className="form-check-label" style={{ color: "#333" }}>
                        {name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="mt-3">
              <h6
                style={{ color: "#002559", cursor: "pointer" }}
                onClick={() => setCategoryOpen(!categoryOpen)}
              >
                Категория
              </h6>
              {categoryOpen && (
                <div>
                  {categoryOptions.map(({ value, label }) => (
                    <div key={value} className="form-check">
                      <input
                        type="radio"
                        value={value}
                        checked={category === value}
                        onChange={() => setCategory(value)}
                        className="form-check-input"
                      />
                      <label className="form-check-label" style={{ color: "#333" }}>
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Сбросить фильтры */}
            <div className="mt-3">
              <button
                onClick={resetFilters}
                className={`btn  ${classes.resetButton}`}
                style={{ width: "100%" }}
              >
                Сбросить
              </button>
            </div>
          </div>

          <div className={`col-9 d-flex ${classes.productList}`}>
            <div className={`d-flex w-100 ${classes.cat}`}>
              {currentProducts.length > 0 ? (
                currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    image={product.image}
                    title={product.title}
                    price={product.price}
                    product={product}
                  />
                ))
              ) : (
                <p>Совпадений не найдено</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Centered Pagination Controls */}
      <div className={`d-flex justify-content-center mt-4 ${classes.pagination}`}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`btn mx-1 ${classes.pageButton}`}
        >
          Назад
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`btn mx-1 ${classes.pageButton} ${currentPage === page ? classes.activePageButton : ''}`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`btn mx-1 ${classes.pageButton}`}
        >
          Вперед
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default ProductList;
