import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import classes from './ProductCard.module.css'; // Import the CSS module

const ProductCard = ({ id, image, title, price, product, onEdit, onDelete, showActions }) => {
  return (
    <div className={` m-3 border-0 ${classes.product_card}`} style={{ borderRadius: "15px",width: '20vw',padding:'10px', height: '400px',  }}>
      <Link to={`/products/${id}`} state={{ product }} className="text-decoration-none text-dark">
        <div className={`bg-light ${classes.card_img_top}`} style={{ height: "300px", borderRadius: "15px 15px 0 0", backgroundColor: "#d3d3d3" }}>
          <img src={image} alt={title} className="card-img-top h-100" style={{ borderRadius: "15px 15px 0 0", objectFit: "cover" }} />
        </div>
        <div className={`card-body text-center ${classes.card_body}`}>
          <h5 className={`card-title mb-1 ${classes.card_title}`}>{title}</h5>
          <p className={`card-text text-primary fw-bold mb-2 ${classes.card_text}`}>{price} BYN</p>
          {showActions && (
            <div className="d-flex justify-content-between">
              <button className="btn btn-sm btn-outline-warning" onClick={() => onEdit(product)}>
                <FontAwesomeIcon icon={faEdit} /> {/* Иконка редактирования */}
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(id)}>
                <FontAwesomeIcon icon={faTrash} /> {/* Иконка удаления */}
              </button>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
