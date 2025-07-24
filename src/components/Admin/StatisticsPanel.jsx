import React, { useEffect, useState } from "react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import axios from "axios";
import './StatisticsPanel.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const StatisticsPanel = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showChart, setShowChart] = useState(false); // Track view state in second chart container

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        await axios.post("http://localhost:5000/api/statistics/update");
        const response = await axios.get("http://localhost:5000/api/statistics");
        setStatistics(response.data);
      } catch (error) {
        console.error("Ошибка при получении статистики:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalSales = {
    week: statistics.sales_last_week || 0,
    month: statistics.sales_last_month || 0,
    year: statistics.total_sales || 0,
  };

  const topProducts = [
    {
      id: statistics.top_product_id,
      sales: statistics.top_product_sales,
      title: statistics.top_product_title,
      price: statistics.top_product_price,
      image: statistics.top_product_image,
    },
    {
      id: statistics.second_top_product_id,
      sales: statistics.second_top_product_sales,
      title: statistics.second_top_product_title,
      price: statistics.second_top_product_price,
      image: statistics.second_top_product_image,
    },
    {
      id: statistics.third_top_product_id,
      sales: statistics.third_top_product_sales,
      title: statistics.third_top_product_title,
      price: statistics.third_top_product_price,
      image: statistics.third_top_product_image,
    },
  ];

  const topUser = {
    name: statistics.user_name,
    email: statistics.user_email,
    orders: statistics.user_orders,
  };

  const categorySales = statistics.category_sales
    ? JSON.parse(statistics.category_sales)
    : {};

  const totalSalesChartData = {
    labels: ["Неделя", "Месяц", "Год"],
    datasets: [
      {
        label: "Продаж",
        data: [totalSales.week, null, null],
        backgroundColor: "rgb(248,121,87)",
        borderColor: "rgb(248,121,87)",
        borderWidth: 1,
      },
      {
        label: "Месяц",
        data: [null, totalSales.month, null],
        backgroundColor: "rgb(54,136,250)",
        borderColor: "rgb(54,136,250)",
        borderWidth: 1,
      },
      {
        label: "Год",
        data: [null, null, totalSales.year],
        backgroundColor: "rgb(38,186,79)",
        borderColor: "rgb(38,186,79)",
        borderWidth: 1,
      },
    ],
  };

  const totalSalesChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Продажи по времени",
      },
    },
  };

  const topProductsChartData = {
    labels: topProducts.map((product) => product.title || "Нет данных"),
    datasets: [
      {
        label: "Продажи топ-продуктов",
        data: topProducts.map((product) => product.sales || 0),
        backgroundColor: ["rgb(248,121,87)", "rgb(54,136,250)", "rgb(38,186,79)"],
        borderColor: ["rgb(248,121,87)", "rgb(54,136,250)", "rgb(38,186,79)"],
        borderWidth: 1,
      },
    ],
  };

  const topProductsChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    cutout: "70%",
  };

  const categoryChartData = {
    labels: Object.keys(categorySales),
    datasets: [
      {
        data: Object.values(categorySales),
        backgroundColor: [
          "rgb(248,121,87)", "rgb(54,136,250)", "rgb(38,186,79)", "rgb(255,174,31)", "rgb(66,103,205)",
        ],
      },
    ],
  };

  const categoryChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
    },
  };

  const toggleChartView = () => setShowChart(!showChart);

  return (
    <div className="statistics-panel">
      <div className="charts-container">
        <div className="chart">
          <h5>КОЛИЧЕСТВО ПРОДАЖ</h5>
          <Bar data={totalSalesChartData} options={totalSalesChartOptions} />
        </div>

        <div className="chart">
          <h5>ТОП ПРОДУКТЫ</h5>
          {showChart ? (
            <div>
              <Doughnut data={topProductsChartData} options={topProductsChartOptions} />
            </div>
          ) : (
            <div className="top-products-cards">
              {topProducts.map((product, index) => (
                <div key={index} className="product-card">
                  <img src={product.image} alt={product.title} className="product-image" />
                  <h5>{product.title}</h5>
                  <p>{product.price} BYN</p>
                  <p>Продажи: {product.sales}</p>
                </div>
              ))}
            </div>
          )}
          <button className="btn btn-primary" onClick={toggleChartView} style={{ position: 'absolute', bottom: '10px', fontSize: '12px' }}>
            {showChart ? "Показать товары" : "Показать в диаграмме"}
          </button>
        </div>

        <div className="chart">
          <h5>КАТЕГОРИИ ТОВАРОВ</h5>
          <div>
            <Pie data={categoryChartData} options={categoryChartOptions} />
          </div>
        </div>

        <div className="chart top-user-container">
  <h5>ТОП ПОЛЬЗОВАТЕЛЬ</h5>
  <div className="user-card">
    <div className="user-card-header">
      <h3>{topUser.name}</h3>
      <p>{topUser.email}</p>
    </div>
    <div className="user-card-body">
      <p><strong>Количество заказов:</strong> {topUser.orders}</p>
    </div>
  </div>
</div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
