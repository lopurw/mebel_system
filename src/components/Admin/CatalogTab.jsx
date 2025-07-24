import React, { useEffect, useState } from "react";
import axios from "axios";
import classes from "./AdminPanel.module.css";
import { Modal, Button, Form } from "react-bootstrap";

function CatalogTab() {
  const [products, setProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState({ name: "", code: "#FFFFFF" }); 
  const colorOptions = [
    { name: "Красный", code: "#FF0000" },
    { name: "Зеленый", code: "#00FF00" },
    { name: "Синий", code: "#0000FF" },
    { name: "Желтый", code: "#FFFF00" },
    { name: "Черный", code: "#000000" },
    { name: "Белый", code: "#FFFFFF" },
  ];
  
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    image: null,
    color: "",
    size: "",
    brand: "",
    category_id: "",
    country: "",
    quantity_pr: "",
  });
  const [supplyQuantity, setSupplyQuantity] = useState("");

  const [editProduct, setEditProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const brandOptions = ["IKEA", "Ashley Furniture", "Wayfair", "Steelcase", "Herman Miller"];
  const countryOptions = ["Беларусь", "Россия", "Китай", "Польша", "Италия"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productResponse = await axios.get("http://localhost:5000/products");
        setProducts(productResponse.data);

        const categoryResponse = await axios.get("http://localhost:5000/categories");
        setCategories(categoryResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    const previewUrl = URL.createObjectURL(file);
    if (isEdit) {
      setEditProduct({ ...editProduct, image: file });
      setImagePreview(previewUrl);
    } else {
      setNewProduct({ ...newProduct, image: file });
      setImagePreview(previewUrl);
    }
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditProduct({ ...editProduct, [name]: value });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color); 
    setNewProduct({ ...newProduct, color: color.name }); 
  };

  const addProduct = async () => {
    setLoading(true);
    const formData = new FormData();
    Object.keys(newProduct).forEach(key => {
      if (key === 'quantity_pr' && !newProduct[key]) {
        formData.append(key, 0);
      } else {
        formData.append(key, newProduct[key]);
      }
    });

    try {
      const response = await axios.post("http://localhost:5000/products/add", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProducts([...products, { ...newProduct, id: response.data.insertId, image: imagePreview }]);
      handleCloseAddModal();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Ошибка при добавлении продукта. Пожалуйста, попробуйте еще раз.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product) => {
    setEditProduct({ ...product });
    setImagePreview(product.image);
    setShowEditModal(true);
  };

  const saveEditProduct = async () => {
    if (!editProduct) return;

    const formData = new FormData();
    Object.keys(editProduct).forEach(key => {
      formData.append(key, editProduct[key]);
    });
    formData.append("supplyQuantity", supplyQuantity);

    try {
      const response = await axios.put(`http://localhost:5000/products/edit/${editProduct.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success) {
        setProducts(products.map(product => 
          product.id === editProduct.id ? { ...product, ...editProduct } : product
        ));
        setShowEditModal(false);
        setImagePreview(null);
        setSupplyQuantity("");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Ошибка при обновлении продукта. Пожалуйста, попробуйте еще раз.");
    }
  };

  const deleteProduct = async (id) => {
    try {
      const response = await axios.delete(`http://localhost:5000/products/delete/${id}`);
      if (response.data.success) {
        setProducts(products.filter(product => product.id !== id));
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const renderFormFields = (product, isEdit = false) => {
    if (!product) return null;

    return (
      <>
        <Form.Group>
          <Form.Label>Название</Form.Label>
          <Form.Control type="text" name="title" value={product.title || ""} onChange={(e) => handleInputChange(e, isEdit)} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Описание</Form.Label>
          <Form.Control as="textarea" rows={3} name="description" value={product.description || ""} onChange={(e) => handleInputChange(e, isEdit)} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Цена</Form.Label>
          <Form.Control type="number" name="price" value={product.price || ""} onChange={(e) => handleInputChange(e, isEdit)} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Цвет</Form.Label>
          <div className={classes.colorDropdown}>
            <button type="button" className={classes.colorButton} style={{ backgroundColor: selectedColor.code || "#fff" }}>
              {selectedColor.name || "Выберите цвет"}
            </button>
            <div className={classes.colorOptions}>
              {colorOptions.map(color => (
                <div
                  key={color.code}
                  className={classes.colorOption}
                  onClick={() => handleColorSelect(color)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '5px 10px',
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: color.code,
                    marginRight: '10px',
                    border: '1px solid #ccc',
                  }} />
                  {color.name}
                </div>
              ))}
            </div>
          </div>
        </Form.Group>
        <Form.Group>
          <Form.Label>Размер</Form.Label>
          <Form.Control type="text" name="size" value={product.size || ""} onChange={(e) => handleInputChange(e, isEdit)} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Категория</Form.Label>
          <Form.Control as="select" name="category_id" value={product.category_id || ""} onChange={(e) => handleInputChange(e, isEdit)}>
            <option value="">Выберите категорию</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Страна</Form.Label>
          <Form.Control as="select" name="country" value={product.country || ""} onChange={(e) => handleInputChange(e, isEdit)}>
            <option value="">Выберите страну</option>
            {countryOptions.map(country => <option key={country}>{country}</option>)}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Бренд</Form.Label>
          <Form.Control as="select" name="brand" value={product.brand || ""} onChange={(e) => handleInputChange(e, isEdit)}>
            <option value="">Выберите бренд</option>
            {brandOptions.map(brand => <option key={brand}>{brand}</option>)}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Страна</Form.Label>
          <Form.Control as="select" name="country" value={product.country || ""} onChange={(e) => handleInputChange(e, isEdit)}>
          <option value="">Выберите страну</option>
            {countryOptions.map(country => <option key={country}>{country}</option>)}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label>Категория</Form.Label>
          <Form.Control as="select" name="category_id" value={product.category_id || ""} onChange={(e) => handleInputChange(e, isEdit)}>
            <option value="">Выберите категорию</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group>
          <Form.Label>Изображение</Form.Label>
          <Form.Control type="file" onChange={(e) => handleFileChange(e, isEdit)} />
          {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100%', marginTop: '10px' }} />}
        </Form.Group>
        <Form.Group>
          <Form.Label>Количество поставки</Form.Label>
          <Form.Control 
            type="number" 
            name="supplyQuantity" 
            value={supplyQuantity || ""} 
            onChange={(e) => setSupplyQuantity(e.target.value)} 
            placeholder="Введите количество поставки" 
          />
        </Form.Group>
      </>
    );
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setImagePreview(null);
    setNewProduct({
      title: "", description: "", price: "", image: null,
      color: "", size: "", brand: "", category_id: "", country: "", quantity_pr: "",
    });
    setSelectedColor({ name: "", code: "#FFFFFF" }); 
  };

  return (
    <div className={classes.CatalogTab}>
      <Button className={classes.butCL} onClick={() => setShowAddModal(true)}>Добавить продукт</Button>
      <div className={`row ${classes.ProductList}`}>
        {products.map(product => (
          <div key={product.id} className={`col-4 ${classes.ProductCard}`}>
            <img src={product.image} alt={product.title} style={{height: '300px'}}/>
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <p>Цена: {product.price} BYN</p>
            <div className={classes.Buttons}>
              <Button onClick={() => handleEditClick(product)} style={{marginRight:'10px'}}>Редактировать</Button>
              <Button onClick={() => deleteProduct(product.id)} variant="danger">Удалить</Button>
            </div>
          </div>
        ))}
      </div>

  
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>Добавить продукт</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {renderFormFields(newProduct)}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>Закрыть</Button>
          <Button variant="primary" onClick={addProduct} disabled={loading}>
            {loading ? "Сохраняем..." : "Сохранить"}
          </Button>
        </Modal.Footer>
      </Modal>

      
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Редактировать продукт</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {renderFormFields(editProduct, true)}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Закрыть</Button>
          <Button variant="primary" onClick={saveEditProduct}>Сохранить</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CatalogTab;
