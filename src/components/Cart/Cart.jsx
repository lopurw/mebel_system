import React, { useState, useEffect } from "react";
import { useCart } from "./CartContext.jsx";
import classes from "./Cart.module.css";
import { Modal, Form, Button, Row, Col, Image, Card, ListGroup, Container, Tabs, Tab } from "react-bootstrap";
import axios from "axios";

const Cart = () => {
  const { cart, setCart, totalPrice, updateCartFromDB } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    house: "",
    apartment: "",
    floor: "",
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // Fetch order history data
  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem("token"); // Get the token from localStorage
      const response = await axios.get('http://localhost:5000/api/orders/history', {
        headers: { Authorization: `Bearer ${token}` }, // Send the token as a Bearer token
      });
      console.log("Order history fetched:", response.data);  // Check the response
      setOrderHistory(response.data);  // Store the order history in the state
    } catch (error) {
      console.error("Ошибка при загрузке истории заказов:", error);
    }
  };
  
  
  
  const handleOrder = async () => { 
    try { 
      const response = await axios.post('http://localhost:5000/api/orders/create', { 
        cartItems: cart, 
        totalPrice, 
        ...formData, 
      }, { 
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }, 
      }); 
      console.log("Заказ создан:", response.data); 
      setCart([]); // Clear cart after order is placed 
      localStorage.removeItem("cart"); // Remove cart from localStorage 
      setShowModal(false); // Close the modal 
    } catch (error) { 
      console.error("Ошибка при создании заказа:", error); 
    } 
  };
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  useEffect(() => {
    const fetchCart = async () => {
      await updateCartFromDB(); // Обновляем корзину при загрузке компонента
    };

    fetchCart();
  }, [updateCartFromDB]);
  const openHistoryModal = () => {
    fetchOrderHistory();  // Fetch order history when opening the modal
    setShowHistoryModal(true);
  };
  const closeHistoryModal = () => setShowHistoryModal(false);

  const handleIncreaseQuantity = async (item) => {
    try {
      // Отправляем запрос на сервер для увеличения количества
      const response = await axios.put(
        `http://localhost:5000/api/cart/increase`, // Путь для увеличения
        { product_id: item.id }, // Данные товара
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      console.log("Ответ от сервера:", response.data);
  
      // Увеличиваем количество товара в состоянии корзины
      const updatedCart = cart.map((cartItem) =>
        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      );
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart)); // Обновляем localStorage
    } catch (error) {
      if (error.response) {
        // Сервер ответил с кодом, который не находится в диапазоне 2xx
        console.error("Ошибка сервера:", error.response.data);
        console.error("Код ответа:", error.response.status);
      } else if (error.request) {
        // Запрос был сделан, но ответа не было
        console.error("Нет ответа от сервера:", error.request);
      } else {
        // Произошла ошибка при настройке запроса
        console.error("Ошибка при настройке запроса:", error.message);
      }
    }
  };
  

  // Функция для уменьшения количества товара
  const handleDecreaseQuantity = async (item) => {
    if (item.quantity === 1) return; // Не уменьшаем количество ниже 1

    try {
      // Отправляем запрос на сервер для уменьшения количества
      const response = await axios.put(
        `http://localhost:5000/api/cart/decrease`, // Путь для уменьшения
        { product_id: item.id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Уменьшаем количество товара в состоянии корзины
      const updatedCart = cart.map((cartItem) =>
        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
      );
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart)); // Обновляем localStorage
    } catch (error) {
      console.error("Ошибка при уменьшении количества товара:", error);
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/cart/remove`,
        {
          data: { product_id: item.id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // Удаляем товар из контекста после успешного удаления из БД
      const updatedCart = cart.filter((cartItem) => cartItem.id !== item.id);
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart)); // Обновляем localStorage
    } catch (error) {
      console.error("Ошибка при удалении товара из корзины:", error);
    }
  };
console.log(orderHistory)
  return (
    <>
    <Row className="mb-0">
      <div className={`container-fluid ${classes.cart_back}`}>
        <div className={`container mt-5 ${classes.cart_cont}`}>
          <Col md={9}>
            <Container>
              <Row>
                {cart.length === 0 ? (
                  <h4>Ваша корзина пуста</h4>
                ) : (
                  cart.map((item) => (
                    <Col key={item.id} md={3} className="mb-4">
                      <Card className={`h-100 ${classes.cartItem}`}>
                        <div className={classes.crest}>
                          <i
                            onClick={() => handleRemoveItem(item)}
                            className="bi bi-x fs-4 text-danger"
                          ></i>
                        </div>
                        <Image
                          src={item.image}
                          alt={item.title}
                          style={{height:'150px'}}
                          fluid
                          className={`w-100 ${classes.productImage}`}
                        />
                        <Card.Body className="cartBody">
                          <Card.Title className={classes.productTitle}>{item.title}</Card.Title>
                          <Card.Text>Цена: {item.price} BYN</Card.Text>
                          <div className="d-flex justify-content-between align-items-center mb-2" >
                            <Button
                              variant="outline-secondary"
                              onClick={() => handleDecreaseQuantity(item)} // Уменьшаем количество
                            >
                              -
                            </Button>
                            <span className={`mx-2 ${classes.quantity}`}>{item.quantity}</span>
                            <Button
                              variant="outline-secondary"
                              onClick={() => handleIncreaseQuantity(item)} // Увеличиваем количество
                            >
                              +
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
            </Container>
          </Col>

          <Col md={4}>
            <Card className={`p-4 ${classes.cartSummary}`}>
              <h4 className="mb-4">Итоговая информация</h4>
              <ListGroup variant="flush">
                {cart.map((item) => (
                  <ListGroup.Item key={item.id} className="d-flex justify-content-between">
                    <span>{item.title} (x{item.quantity})</span>
                    <span>{(item.price * item.quantity).toFixed(2)} BYN</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <hr />
              <h5 className="d-flex justify-content-between">
                <span>{`Итоговая цена: `}</span>
                <span>{totalPrice.toFixed(2)} BYN</span>
              </h5>
              <Button
    variant="success"
    className={`mt-3 w-100 ${classes.button}`}
    onClick={openModal}// Вызываем функцию оформления заказа
>
    Заказать
</Button>
<Button variant="secondary" className={`mt-3 w-100 ${classes.button}`} onClick={openHistoryModal}>
                  История заказов
                </Button>
            </Card>
          </Col>
        </div>
      </div>
    </Row>
    <Modal show={showHistoryModal} onHide={closeHistoryModal} centered size="lg">
      <Modal.Header closeButton className={classes.customModalHeader}>
        <Modal.Title className={classes.modalTitle}>История заказов</Modal.Title>
      </Modal.Header>
      <Modal.Body className={classes.customModalBody}>
        {orderHistory.length === 0 ? (
          <p className="text-center">Нет заказов</p>
        ) : (
          orderHistory.map((order) => (
            <Card key={order.order_id} className={`mb-3 ${classes.customCard}`}>
              <Card.Body>
                <Card.Title className={classes.customCardTitle}>
                  Заказ от {new Date(order.order_date).toLocaleDateString()}
                </Card.Title>
                <Card.Text className={classes.customOrderStatus}>
                  Статус: {order.order_status}
                </Card.Text>

                {/* List of products in the order */}
                <ListGroup variant="flush">
                  {order.product_details.split(';').map((detail, index) => {
                    const [productTitleAndQuantity, priceAndTotal] = detail.split(' - ');
                    const [productTitle, quantityPart] = productTitleAndQuantity.split(' (');
                    const quantity = quantityPart.replace(' units)', ''); // Extract quantity (3)
                    const unitPrice = priceAndTotal.split(' ')[0]; // Extract unit price (330.00)

                    return (
                      <ListGroup.Item key={index} className={classes.customListItem}>
                        <strong>{productTitle.trim()}</strong> - {unitPrice} х {quantity} ед.
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>

                {/* Total price of the order */}
                <h5 className={`d-flex justify-content-between ${classes.customTotalPrice}`}>
                  <span>Итоговая цена:</span>
                  <span>{order.total_order_price.toFixed(2)} BYN</span>
                </h5>
              </Card.Body>
            </Card>
          ))
        )}
      </Modal.Body>
      <Modal.Footer className={classes.customModalFooter}>
        <Button variant="secondary" className={classes.btnSecondary} onClick={closeHistoryModal}>Закрыть</Button>
      </Modal.Footer>
    </Modal>




     <Modal show={showModal} onHide={closeModal}>
     <Modal.Header closeButton>
       <Modal.Title>Оформление заказа</Modal.Title>
     </Modal.Header>
     <Modal.Body>
       <Form>
         <Form.Group controlId="firstName">
           <Form.Label style={{marginTop:'10px'}}>Имя</Form.Label>
           <Form.Control name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} />
         </Form.Group>
         <Form.Group controlId="lastName">
           <Form.Label style={{marginTop:'10px'}}>Фамилия</Form.Label>
           <Form.Control name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} />
         </Form.Group>
         <Form.Group controlId="phone">
           <Form.Label style={{marginTop:'10px'}}>Телефон</Form.Label>
           <Form.Control name="phone" type="text" value={formData.phone} onChange={handleInputChange} />
         </Form.Group>
         <Form.Group controlId="street">
           <Form.Label style={{marginTop:'10px'}}>Улица</Form.Label>
           <Form.Control name="street" type="text" value={formData.street} onChange={handleInputChange} />
         </Form.Group>
         <Form.Group controlId="house">
           <Form.Label style={{marginTop:'10px'}}>Дом</Form.Label>
           <Form.Control name="house" type="text" value={formData.house} onChange={handleInputChange} />
         </Form.Group>
         <Form.Group controlId="apartment">
           <Form.Label style={{marginTop:'10px'}}>Квартира</Form.Label>
           <Form.Control name="apartment" type="text" value={formData.apartment} onChange={handleInputChange} />
         </Form.Group>
         <Form.Group controlId="floor">
           <Form.Label style={{marginTop:'10px'}}>Этаж</Form.Label>
           <Form.Control name="floor" type="number" value={formData.floor} onChange={handleInputChange} />
         </Form.Group>
       </Form>
     </Modal.Body>
     <Modal.Footer>
       <Button variant="secondary" onClick={closeModal}>
         Отмена
       </Button>
       <Button variant="primary" onClick={handleOrder}>
         Оформить
       </Button>
     </Modal.Footer>
   </Modal>
   </>
  );
};

export default Cart;