import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductById } from '../api/productsApi';
import { formatPrice, getFinalPrice } from '../utils/productUtils';

function ProductPage({ onAdd }) {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true); setError('');
    getProductById(productId, { signal: controller.signal }).then((result) => setProduct(result)).catch((requestError) => { if (requestError.name !== 'AbortError') setError(requestError.message); }).finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, [productId]);

  if (isLoading) return <main id="main-content" className="page-shell"><div className="loading-state" role="status"><span className="spinner" /> Загружаем товар...</div></main>;
  if (error) return <main id="main-content" className="page-shell"><div className="message message--error" role="alert">{error}<Link className="button button--small" to="/catalog">Вернуться в каталог</Link></div></main>;
  if (!product) return <main id="main-content" className="page-shell"><div className="empty-state empty-state--page"><span className="empty-state__icon" aria-hidden="true">?</span><h1>Товар не найден</h1><p>Похоже, такой рыбки больше нет в каталоге.</p><Link className="button" to="/catalog">Вернуться в каталог</Link></div></main>;

  return <main id="main-content" className="page-shell"><Link className="back-link" to="/catalog">← Вернуться в каталог</Link><article className="product-detail"><div className="product-detail__image"><img src={product.image} alt={product.imageAlt} /></div><div className="product-detail__content"><p className="eyebrow">{product.categoryName}</p><h1>{product.title}</h1><div className="detail-rating"><span>★ {product.rating}</span><span>{product.isAvailable ? 'В наличии' : 'Под заказ'}</span></div><p className="product-detail__description">{product.description}</p><p>{product.details}</p><div className="detail-price">{formatPrice(getFinalPrice(product))}{product.discountPercent > 0 && <del>{formatPrice(product.price)}</del>}</div><div className="product-detail__actions"><button className="button button--large" type="button" disabled={!product.isAvailable} onClick={() => onAdd(product)}>{product.isAvailable ? 'Добавить в корзину' : 'Нет в наличии'}</button><Link className="button button--ghost button--large" to={`/order?product=${product.id}`}>Оставить заявку</Link></div></div></article></main>;
}

export default ProductPage;
