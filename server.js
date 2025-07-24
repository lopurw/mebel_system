import express from "express";
import { createConnection } from "mysql";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer"; // for handling file uploads
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken"; // for token handling

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Configure Multer for storing images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
const db = createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "mebel",
});
const JWT_SECRET = "2345"; // Secret key for signing JWTs
// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err);
    return;
  }
  console.log("Connected to the database successfully!");
});
// Fetch products with optional filters
app.get("/products", (req, res) => {
  const { search, priceRange, color, brand, country, size, category } = req.query;
  let sql = "SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1";
  const params = [];

  if (search) {
    sql += " AND p.title LIKE ?";
    params.push(`%${search}%`);
  }

  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split(",").map(Number);
    sql += " AND p.price BETWEEN ? AND ?";
    params.push(minPrice, maxPrice);
  }

  // Handle multiple values for color, brand, country, size
  if (color) {
    const colorList = color.split(",");
    sql += " AND p.color IN (?)";
    params.push(colorList);
  }

  if (brand) {
    const brandList = brand.split(",");
    sql += " AND p.brand IN (?)";
    params.push(brandList);
  }

  if (country) {
    const countryList = country.split(",");
    sql += " AND p.country IN (?)";
    params.push(countryList);
  }

  if (size) {
    const sizeList = size.split(",");
    // Process size ranges as separate conditions
    sizeList.forEach((range) => {
      const [min, max] = range.split("-").map(Number);
      sql += " AND p.size BETWEEN ? AND ?";
      params.push(min, max);
    });
  }

  if (category) {
    sql += " AND p.category_id = ?";
    params.push(category);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});


app.post("/products/add", upload.single("image"), (req, res) => {
  const {
    title,
    description,
    price,
    color,
    size,
    brand,
    category_id,
    country,
    quantity_pr,
  } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null; // Получаем путь к загруженному изображению

  const sql =
    "INSERT INTO products (title, description, price, image, color, size, brand, category_id, country, quantity_pr) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    sql,
    [
      title,
      description,
      price,
      image,
      color,
      size,
      brand,
      category_id,
      country,
      quantity_pr,
    ],
    (err, result) => {
      if (err) {
        console.error("Ошибка базы данных:", err);
        return res
          .status(500)
          .json({
            error: "Не удалось добавить продукт. Пожалуйста, проверьте ввод.",
          });
      }
      res.json({
        success: true,
        message: "Продукт успешно добавлен",
        insertId: result.insertId,
      });
    }
  );
});

app.put("/products/edit/:id", upload.single("image"), (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    price,
    color,
    size,
    brand,
    category_id,
    country,
    supplyQuantity,
  } = req.body; // Added supplyQuantity
  const newImage = req.file ? `/uploads/${req.file.filename}` : null;

  // Step 1: Fetch the current product image path
  db.query("SELECT image FROM products WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error fetching image:", err);
      return res.status(500).json({ error: "Error fetching image" });
    }

    const oldImagePath = results[0]?.image;

    // Step 2: Update product details
    const sql =
      "UPDATE products SET title = ?, description = ?, price = ?, image = ?, color = ?, size = ?, brand = ?, category_id = ?, country = ? WHERE id = ?";
    db.query(
      sql,
      [
        title,
        description,
        price,
        newImage || oldImagePath,
        color,
        size,
        brand,
        category_id,
        country,
        id,
      ],
      (err, result) => {
        if (err) {
          console.error("Error updating product:", err);
          return res.status(500).json({ error: "Error updating product" });
        }

        // Step 3: Insert supply data if quantity is provided
        if (supplyQuantity) {
          db.query(
            "INSERT INTO supplies (product_id, quantity, supply_date) VALUES (?, ?, ?)",
            [id, supplyQuantity, new Date()],
            (err) => {
              if (err) {
                console.error("Error adding supply:", err);
                return res.status(500).json({ error: "Error adding supply" });
              }
            }
          );
        }

        // Step 4: Respond with success message
        res.json({ success: true, message: "Product updated successfully" });
      }
    );
  });
});

// Delete product and its image
app.delete("/products/delete/:id", (req, res) => {
  const { id } = req.params;

  // Retrieve image path before deletion
  db.query("SELECT image FROM products WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }

    const imagePath = results[0]?.image;
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err });
      }

      // Delete image file from filesystem
      if (imagePath) {
        fs.unlink(path.join(__dirname, imagePath), (err) => {
          if (err) console.error("Failed to delete image:", err);
        });
      }

      res.json({ success: true, message: "Product deleted successfully" });
    });
  });
});

// Categories endpoint
app.get("/categories", (req, res) => {
  db.query("SELECT * FROM categories", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);
  });
});

// Поставки
app.post("/supplies", (req, res) => {
  const { product_id, quantity } = req.body;
  const supplyDate = new Date(); // Use the current date

  const sql =
    "INSERT INTO supplies (product_id, quantity, supply_date) VALUES (?, ?, ?)";
  db.query(sql, [product_id, quantity, supplyDate], (err, result) => {
    if (err) {
      console.error("Error adding supply:", err);
      return res.status(500).json({ error: "Не удалось добавить поставку." });
    }
    res.json({ success: true, message: "Поставка успешно добавлена." });
  });
});

//регистрация
app.post("/api/register", (req, res) => {
  console.log(req.body);
  const { username, email, password } = req.body;

  // Добавляем поле role в SQL-запрос
  const sql =
    "INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())";

  // Передаем значение 'user' для поля role
  db.query(sql, [username, email, password, "user"], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: "User registered successfully!",
      userId: result.insertId,
    });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?"; // Ищем пользователя по email
  db.query(sql, [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Ошибка сервера" });
    }

    // Если пользователь не найден
    if (result.length === 0) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }

    const user = result[0]; // Берём первого найденного пользователя

    // Сравниваем введённый пароль с паролем из базы данных (без хеширования)
    if (user.password === password) {
      // Генерация токена
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" }); // Токен действителен 1 час
      return res.json({
        success: true,
        message: "Успешный вход",
        token,
        user: {
          username: user.username,
          role: user.role, // Передаем роль пользователя в ответе
        },
      });
    } else {
      return res.status(400).json({ message: "Неверный пароль" });
    }
  });
});
// Запуск сервера на порту 5000
app.listen(5000, () => {
  console.log("Сервер запущен на порту 5000");
});
app.post("/api/cart/add", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Извлекаем токен

  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Декодируем токен и получаем ID пользователя

    const userId = decoded.id; // Получаем ID пользователя из токена

    const { product_id, quantity } = req.body;

    // Сначала проверяем, есть ли уже такой товар в корзине пользователя

    const checkSql =
      "SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?";

    db.query(checkSql, [userId, product_id], (err, results) => {
      if (err) {
        console.error(err);

        return res.status(500).json({ message: "Ошибка проверки корзины" });
      }

      if (results.length > 0) {
        // Если товар уже есть в корзине, обновляем его количество

        const newQuantity = results[0].quantity + quantity;

        const updateSql =
          "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?";

        db.query(
          updateSql,
          [newQuantity, userId, product_id],
          (err, result) => {
            if (err) {
              console.error(err);

              return res
                .status(500)
                .json({ message: "Ошибка обновления корзины" });
            }

            return res.json({
              success: true,
              message: "Количество товара обновлено в корзине",
            });
          }
        );
      } else {
        // Если товара нет в корзине, добавляем его

        const insertSql =
          "INSERT INTO cart_items (user_id, product_id, quantity, created_at) VALUES (?, ?, ?, NOW())";
        db.query(insertSql, [userId, product_id, quantity], (err, result) => {
          if (err) {
            console.error(err);

            return res
              .status(500)
              .json({ message: "Ошибка добавления в корзину" });
          }

          return res.json({
            success: true,
            message: "Товар добавлен в корзину",
          });
        });
      }
    });
  } catch (error) {
    return res.status(401).json({ message: "Неверный токен" });
  }
});

// Удаление товара из корзины
app.delete("/api/cart/remove", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Извлекаем токен
  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Декодируем токен и получаем ID пользователя
    const userId = decoded.id; // Получаем ID пользователя из токена
    const { product_id } = req.body;

    const deleteSql =
      "DELETE FROM cart_items WHERE user_id = ? AND product_id = ?";
    db.query(deleteSql, [userId, product_id], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Ошибка удаления товара из корзины" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Товар не найден в корзине" });
      }
      return res.json({ success: true, message: "Товар удален из корзины" });
    });
  } catch (error) {
    return res.status(401).json({ message: "Неверный токен" });
  }
});
// Получение избранных товаров// Получение списка избранных товаров для пользователя
app.get("/api/favorites", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Извлекаем токен
  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Декодируем токен
    const userId = decoded.id; // Получаем ID пользователя из токена

    const sql =
      "SELECT f.product_id, p.title, p.price, p.image FROM favorites f JOIN products p ON f.product_id = p.id WHERE f.user_id = ?";
    db.query(sql, [userId], (err, results) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json({ message: "Ошибка получения избранных товаров" });
      }

      // Check if results are empty
      if (results.length === 0) {
        return res.json([]); // Return an empty array if no favorites found
      }

      res.json(results); // Отправляем массив объектов избранных товаров
    });
  } catch (error) {
    return res.status(401).json({ message: "Неверный токен" });
  }
});

// Добавление товара в избранное
app.post("/api/favorites/add", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Извлекаем токен
  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Декодируем токен и получаем ID пользователя
    const userId = decoded.id; // Получаем ID пользователя из токена
    const { product_id } = req.body;

    // Проверяем, есть ли уже такой товар в избранном
    const checkSql =
      "SELECT * FROM favorites WHERE user_id = ? AND product_id = ?";
    db.query(checkSql, [userId, product_id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Ошибка проверки избранного" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Товар уже в избранном" });
      } else {
        // Если товара нет в избранном, добавляем его
        const insertSql =
          "INSERT INTO favorites (user_id, product_id, created_at) VALUES (?, ?, NOW())";
        db.query(insertSql, [userId, product_id], (err, result) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({ message: "Ошибка добавления в избранное" });
          }
          return res.json({
            success: true,
            message: "Товар добавлен в избранное",
          });
        });
      }
    });
  } catch (error) {
    return res.status(401).json({ message: "Неверный токен" });
  }
});
// Проверка, находится ли товар в избранном
app.get("/api/favorites/check/:product_id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const { product_id } = req.params;

    const checkSql =
      "SELECT * FROM favorites WHERE user_id = ? AND product_id = ?";
    db.query(checkSql, [userId, product_id], (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка проверки избранного" });
      }
      return res.json({ isFavorite: results.length > 0 });
    });
  } catch (error) {
    return res.status(401).json({ message: "Неверный токен" });
  }
});

// Удаление товара из избранного
app.delete("/api/favorites/remove/:product_id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const { product_id } = req.params;

    const deleteSql =
      "DELETE FROM favorites WHERE user_id = ? AND product_id = ?";
    db.query(deleteSql, [userId, product_id], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Ошибка удаления из избранного" });
      }
      return res.json({ success: true, message: "Товар удален из избранного" });
    });
  } catch (error) {
    return res.status(401).json({ message: "Неверный токен" });
  }
});
app.put("/api/cart/decrease", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Извлекаем токен
  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Декодируем токен и получаем ID пользователя
    const userId = decoded.id; // Получаем ID пользователя из токена
    const { product_id } = req.body;

    // Сначала проверим, что количество товара больше 1
    const selectSql =
      "SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?";
    db.query(selectSql, [userId, product_id], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Ошибка при проверке количества товара" });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "Товар не найден в корзине" });
      }
      const currentQuantity = result[0].quantity;
      if (currentQuantity <= 1) {
        return res
          .status(400)
          .json({ message: "Нельзя уменьшить количество товара ниже 1" });
      }

      // Если количество больше 1, уменьшаем его
      const updateSql =
        "UPDATE cart_items SET quantity = quantity - 1 WHERE user_id = ? AND product_id = ?";
      db.query(updateSql, [userId, product_id], (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Ошибка при уменьшении количества товара" });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Товар не найден в корзине" });
        }
        return res.json({
          success: true,
          message: "Количество товара уменьшено",
        });
      });
    });
  } catch (error) {
    return res.status(401).json({ message: "Неверный токен" });
  }
});
// Увеличение количества товара в корзине
app.put("/api/cart/increase", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Извлекаем токен
  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Декодируем токен и получаем ID пользователя
    const userId = decoded.id; // Получаем ID пользователя из токена
    const { product_id } = req.body;

    const updateSql =
      "UPDATE cart_items SET quantity = quantity + 1 WHERE user_id = ? AND product_id = ?";
    db.query(updateSql, [userId, product_id], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Ошибка при увеличении количества товара" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Товар не найден в корзине" });
      }
      return res.json({
        success: true,
        message: "Количество товара увеличено",
      });
    });
  } catch (error) {
    return res.status(401).json({ message: "Неверный токен" });
  }
});
// Новый маршрут для получения администраторов
app.get("/api/admins", (req, res) => {
  const sql = 'SELECT id, username, email FROM users WHERE role = "admin"';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Новый маршрут для добавления администратора
app.post("/api/admins/add", (req, res) => {
  const { username, email, password } = req.body;
  const sql =
    'INSERT INTO users (username, email, password, role, created_at) VALUES (?, ?, ?, "admin", NOW())';
  db.query(sql, [username, email, password], (err, result) => {
    // Убрали хеширование пароля
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Администратор добавлен" });
  });
});

// Новый маршрут для изменения данных администратора
app.put("/api/admins/edit/:id", (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
  const fields = [];
  const params = [];

  if (username) {
    fields.push("username = ?");
    params.push(username);
  }
  if (email) {
    fields.push("email = ?");
    params.push(email);
  }
  if (password !== undefined) {
    // Убедитесь, что пароль может быть пустым
    fields.push("password = ?");
    params.push(password);
  }
  params.push(id);
  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Данные администратора обновлены" });
  });
});
app.delete("/api/admins/delete/:id", (req, res) => {
  const { id } = req.params;
  console.log(`Deleting admin with ID: ${id}`); // Добавьте эту строку для отладки
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Администратор не найден" });
    }
    res.json({ message: "Администратор удален" });
  });
});
app.post("/api/orders/create", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Требуется авторизация" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;
    const {
      cartItems,
      totalPrice,
      firstName,
      lastName,
      phone,
      street,
      house,
      apartment,
      floor,
    } = req.body;

    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ message: "Неверный формат данных" });
    }

    const insertOrderSql = `
      INSERT INTO orders (user_id, total_price, first_name, last_name, phone, street, house, apartment, floor, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'оформлен')
    `;
    db.query(
      insertOrderSql,
      [
        userId,
        totalPrice,
        firstName,
        lastName,
        phone,
        street,
        house,
        apartment,
        floor,
      ],
      (err, orderResult) => {
        if (err) {
          console.error("Ошибка при создании заказа:", err);
          return res.status(500).json({ message: "Ошибка создания заказа" });
        }

        const orderId = orderResult.insertId;
        const orderItemsValues = cartItems.map((item) => [
          orderId,
          item.id,
          item.quantity,
        ]);
        const insertOrderItemsSql =
          "INSERT INTO order_items (order_id, product_id, quantity) VALUES ?";

        db.query(insertOrderItemsSql, [orderItemsValues], (err) => {
          if (err) {
            console.error("Ошибка добавления товаров в заказ:", err);
            return res
              .status(500)
              .json({ message: "Ошибка добавления товаров в заказ" });
          }

          const deleteCartSql = "DELETE FROM cart_items WHERE user_id = ?";
          db.query(deleteCartSql, [userId], (err) => {
            if (err) {
              console.error("Ошибка очистки корзины:", err);
              return res
                .status(500)
                .json({ message: "Ошибка очистки корзины" });
            }
            res.json({
              success: true,
              message: "Заказ успешно создан",
              orderId,
            });
          });
        });
      }
    );
  } catch (error) {
    console.error("Ошибка при проверке токена:", error);
    return res.status(401).json({ message: "Неверный токен" });
  }
});app.get('/api/orders', (req, res) => {
  const { status } = req.query;  // Получаем параметр status из query

  let sql = `
    SELECT 
        u.username, 
        o.id AS order_id,
        o.created_at AS order_date, 
        o.status,
        oi.product_id, 
        p.title, 
        oi.quantity, 
        p.price,
        o.first_name,
        o.last_name,
        o.phone,
        o.street,
        o.house,
        o.apartment,
        o.floor
    FROM 
        orders o 
    JOIN 
        order_items oi ON o.id = oi.order_id 
    JOIN 
        users u ON o.user_id = u.id 
    JOIN 
        products p ON oi.product_id = p.id
  `;

  const params = [];

  // Если передан статус, добавляем его в WHERE-условие
  if (status) {
    sql += ' WHERE o.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY o.created_at DESC';  // Сортировка по дате

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }

    // Группируем заказы по ID заказа
    const orders = results.reduce((acc, order) => {
      const { username, order_id, order_date, status, product_id, title, quantity, price, first_name, last_name, phone, street, house, apartment, floor } = order;

      // Проверяем, есть ли такой заказ в группе
      const existingOrder = acc.find(o => o.order_id === order_id);
      
      if (existingOrder) {
        // Если заказ существует, добавляем новый товар
        existingOrder.items.push({ product_id, title, quantity, price });
      } else {
        // Если заказ не существует, создаем новый
        acc.push({
          username,
          order_id,
          order_date,
          status,
          items: [{ product_id, title, quantity, price }],
          first_name,
          last_name,
          phone,
          street,
          house,
          apartment,
          floor,
        });
      }
      
      return acc;
    }, []);

    res.json(orders);
  });
});
app.put('/api/orders/:orderId/status', (req, res) => {
  const { status } = req.body;
  const { orderId } = req.params;

  // Проверяем, что статус валидный
  const validStatuses = ['оформлен', 'одобрен', 'собран', 'в пути', 'завершен']; // добавлен статус 'завершен'
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Неверный статус' });
  }

  const updateStatusSql = 'UPDATE orders SET status = ? WHERE id = ?';
  db.query(updateStatusSql, [status, orderId], (err) => {
    if (err) {
      console.error('Ошибка при обновлении статуса заказа:', err);
      return res.status(500).json({ message: 'Ошибка при обновлении статуса' });
    }

    res.json({ success: true, message: 'Статус заказа обновлен' });
  });
});

// app.get('/api/admin/statistics', async (req, res) => {
//   try {
//       const monthlySalesResult = await db.query(`SELECT MONTH(created_at) as month, SUM(total_price) as sales FROM orders WHERE YEAR(created_at) = YEAR(CURRENT_DATE) GROUP BY month`);
//       const yearlySalesResult = await db.query(`SELECT YEAR(created_at) as year, SUM(total_price) as sales FROM orders GROUP BY year`);
//       const topSellingProductsResult = await db.query(`SELECT products.title, SUM(order_items.quantity) as sales FROM order_items JOIN products ON order_items.product_id = products.id GROUP BY products.id ORDER BY sales DESC LIMIT 2`);
//       const activeUsersResult = await db.query(`SELECT users.username, COUNT(orders.id) as activities FROM orders JOIN users ON orders.user_id = users.id GROUP BY users.id ORDER BY activities DESC LIMIT 2`);
//       const categoryPopularityResult = await db.query(`SELECT categories.name, COUNT(products.id) as counts FROM products JOIN categories ON products.category_id = categories.id GROUP BY categories.id`);

//       // Логи для отладки (по желанию)
//       console.log("Завершены все запросы, получены результаты.");

//       const monthlySales = monthlySalesResult[0]; // Измените, если используется другой формат
//       const yearlySales = yearlySalesResult[0];
//       const topSellingProducts = topSellingProductsResult[0];
//       const activeUsers = activeUsersResult[0];
//       const categoryPopularity = categoryPopularityResult[0];

//       // Убедитесь, что данные получены
//       if (!monthlySales || !yearlySales || !topSellingProducts || !activeUsers || !categoryPopularity) {
//           throw new Error("Один из запросов вернул пустые данные");
//       }

//       res.json({
//           sales: { labels: monthlySales.map(ms => ms.month), month: monthlySales.map(ms => ms.sales), year: yearlySales.map(ys => ys.sales) },
//           topSelling: { names: topSellingProducts.map(tp => tp.title), sales: topSellingProducts.map(tp => tp.sales) },
//           userActivity: { names: activeUsers.map(au => au.username), activities: activeUsers.map(au => au.activities) },
//           categoryData: { categories: categoryPopularity.map(cp => cp.name), counts: categoryPopularity.map(cp => cp.counts) },
//       });
//   } catch (error) {
//       console.error("Ошибка в запросе:", error.message);
//       res.status(500).send("Error retrieving statistics: " + error.message);
//   }
// });
// app.js или server.js
// app.get('/api/admin/top-selling-products', async (req, res) => {
//   try {
//       const topSellingProductsResult = await db.query(`
//           SELECT products.title, SUM(order_items.quantity) as sales
//           FROM order_items
//           JOIN products ON order_items.product_id = products.id
//           GROUP BY products.id
//           ORDER BY sales DESC
//           LIMIT 2
//       `);

//       // Логи для отладки
//       console.log("Результаты запроса:", topSellingProductsResult);

//       // Убедитесь, что результат не пуст
//       if (topSellingProductsResult.length === 0) {
//           return res.json([]); // Возвращаем пустой массив, если нет данных
//       }

//       res.json(topSellingProductsResult[0]); // Возвращаем массив с результатами
//   } catch (error) {
//       console.error("Ошибка в запросе:", error.message);
//       res.status(500).send("Error retrieving top selling products: " + error.message);
//   }
// });
// Вызов процедуры insert_statistics
app.post("/api/statistics/update", (req, res) => {
  db.query("CALL insert_statistics()", (err, results) => {
    if (err) {
      console.error("Ошибка при вызове процедуры insert_statistics:", err);
      return res.status(500).send("Ошибка при обновлении статистики");
    }
    res.send({ message: "Statistics updated successfully!" });
  });
});
// Assuming you have access to the `db` object (a MySQL database connection)
app.get("/api/statistics", (req, res) => {
  const query = `
    SELECT s.*, p1.title AS top_product_title, p1.price AS top_product_price, p1.image AS top_product_image,
           p2.title AS second_top_product_title, p2.price AS second_top_product_price, p2.image AS second_top_product_image,
           p3.title AS third_top_product_title, p3.price AS third_top_product_price, p3.image AS third_top_product_image,
           u.username AS user_name, u.email AS user_email, 
           (SELECT COUNT(*) FROM orders WHERE user_id = s.active_user_id) AS user_orders
    FROM statistics s
    LEFT JOIN products p1 ON s.top_product_id = p1.id
    LEFT JOIN products p2 ON s.second_top_product_id = p2.id
    LEFT JOIN products p3 ON s.third_top_product_id = p3.id
    LEFT JOIN users u ON s.active_user_id = u.id
    ORDER BY s.updated_at DESC LIMIT 1;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Ошибка при получении статистики:", err);
      return res.status(500).send("Ошибка при получении статистики");
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.json({});
    }
  });
});


app.get("/api/orders/history", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from the header

  if (!token) {
    return res.status(401).json({ message: "Authorization required" });
  }

  try {
    // Verify the token with the secret
    const decoded = jwt.verify(token, JWT_SECRET); // Make sure the secret is passed here
    const userId = decoded.id; // Get the userId from the decoded token

    // Updated SQL query to fetch orders with products
    const query = `
      SELECT 
        o.id AS order_id,
        o.total_price AS total_order_price,
        o.created_at AS order_date,
        o.status AS order_status,
        GROUP_CONCAT(
          CONCAT(
            p.title, ' (', oi.quantity, ' units) - ', 
            p.price, ' per unit, Total: ', (oi.quantity * p.price)
          ) SEPARATOR '; ') AS product_details
      FROM 
        users u
      JOIN 
        orders o ON u.id = o.user_id
      JOIN 
        order_items oi ON o.id = oi.order_id
      JOIN 
        products p ON oi.product_id = p.id
      WHERE 
        u.id = ?
      GROUP BY 
        o.id, o.total_price, o.created_at, o.status
      ORDER BY 
        o.created_at DESC;
    `;

    // Execute the query and send the result to the client
    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("Error executing query: ", err);
        return res.status(500).json({ message: "Database error" });
      }
      return res.json(results); // Return the results to the frontend
    });
  } catch (error) {
    console.error("JWT error: ", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});
