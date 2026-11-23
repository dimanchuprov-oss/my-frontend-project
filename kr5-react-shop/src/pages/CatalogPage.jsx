import { useEffect, useMemo, useState } from 'react';
import CatalogControls from '../components/CatalogControls';
import ProductList from '../components/ProductList';
import { getProducts } from '../api/productsApi';
import { getCategories, getPreparedProducts } from '../utils/productUtils';

const initialFilters = { query: '', category: 'all', sort: 'default', onlyAvailable: false, minPrice: '', maxPrice: '' };

function CatalogPage({ favorites, onToggleFavorite, onAdd }) {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadProducts() {
      setIsLoading(true); setError('');
      try { setProducts(await getProducts({ signal: controller.signal })); }
      catch (requestError) { if (requestError.name !== 'AbortError') setError(requestError.message || 'Не удалось загрузить каталог.'); }
      finally { if (!controller.signal.aborted) setIsLoading(false); }
    }
    loadProducts();
    return () => controller.abort();
  }, [reloadKey]);

  const categories = useMemo(() => getCategories(products), [products]);
  const visibleProducts = useMemo(() => getPreparedProducts(products, filters), [products, filters]);
  function updateFilter(name, value) { setFilters((current) => ({ ...current, [name]: value })); }

  return <main id="main-content" className="page-shell catalog-page">
    <div className="page-intro"><p className="eyebrow">Каталог FishHunter</p><h1>Найдите своего<br /><em>идеального соседа</em></h1><p>Изучите коллекцию рыбок с описаниями и рекомендациями по содержанию.</p></div>
    {isLoading && <div className="loading-state" role="status"><span className="spinner" /> Загружаем каталог...</div>}
    {error && <div className="message message--error" role="alert"><strong>Каталог временно недоступен.</strong><span>{error}</span><button className="button button--small" type="button" onClick={() => setReloadKey((key) => key + 1)}>Повторить загрузку</button></div>}
    {!isLoading && !error && <><CatalogControls filters={filters} categories={categories} onChange={updateFilter} onReset={() => setFilters(initialFilters)} resultCount={visibleProducts.length} /><ProductList products={visibleProducts} favorites={favorites} onToggleFavorite={onToggleFavorite} onAdd={onAdd} /></>}
  </main>;
}

export default CatalogPage;
