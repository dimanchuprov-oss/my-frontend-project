import ProductCard from './ProductCard';

function ProductList({ products, favorites, onToggleFavorite, onAdd }) {
  if (products.length === 0) {
    return <div className="empty-state"><span className="empty-state__icon" aria-hidden="true">⌕</span><h3>Ничего не найдено</h3><p>Попробуйте изменить поисковый запрос или сбросить фильтры.</p></div>;
  }

  return <div className="products-grid">{products.map((product) => <ProductCard key={product.id} product={product} isFavorite={favorites.includes(product.id)} onToggleFavorite={onToggleFavorite} onAdd={onAdd} />)}</div>;
}

export default ProductList;
