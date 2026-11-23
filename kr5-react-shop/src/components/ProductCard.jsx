import { Link } from 'react-router-dom';
import { formatPrice, getFinalPrice } from '../utils/productUtils';

function ProductCard({ product, isFavorite, onToggleFavorite, onAdd }) {
  const finalPrice = getFinalPrice(product);
  return (
    <article className="product-card">
      <div className="product-card__media">
        <img src={product.image} srcSet={`${product.imageSmall} 480w, ${product.image} 960w`} sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 320px" alt={product.imageAlt} />
        <button className={`favorite-button${isFavorite ? ' favorite-button--active' : ''}`} type="button" onClick={() => onToggleFavorite(product.id)} aria-label={isFavorite ? `Убрать ${product.title} из избранного` : `Добавить ${product.title} в избранное`} aria-pressed={isFavorite}>♥</button>
        {product.discountPercent > 0 && <span className="discount-badge">−{product.discountPercent}%</span>}
      </div>
      <div className="product-card__body">
        <div className="product-card__meta"><span>{product.categoryName}</span><span className="rating">★ {product.rating}</span></div>
        <h3><Link to={`/catalog/${product.id}`}>{product.title}</Link></h3>
        <p>{product.description}</p>
        <div className="product-card__bottom">
          <div className="price-block"><strong>{formatPrice(finalPrice)}</strong>{product.discountPercent > 0 && <del>{formatPrice(product.price)}</del>}</div>
          <span className={`availability${product.isAvailable ? '' : ' availability--out'}`}>{product.isAvailable ? 'В наличии' : 'Под заказ'}</span>
        </div>
        <div className="product-card__actions">
          <Link className="button button--ghost" to={`/catalog/${product.id}`}>Подробнее</Link>
          <button className="button" type="button" disabled={!product.isAvailable} onClick={() => onAdd(product)}>{product.isAvailable ? 'В корзину' : 'Нет в наличии'}</button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
