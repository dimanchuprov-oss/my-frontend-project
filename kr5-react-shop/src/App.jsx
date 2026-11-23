import { useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import OrderPage from './pages/OrderPage';
import CartPage from './pages/CartPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css';

const CART_KEY = 'fishhunter-cart';
const FAVORITES_KEY = 'fishhunter-favorites';

function readStorage(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; }
}

function App() {
  const [cartItems, setCartItems] = useState(() => readStorage(CART_KEY, []));
  const [favorites, setFavorites] = useState(() => readStorage(FAVORITES_KEY, []));
  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  function addToCart(product) { setCartItems((current) => { const existing = current.find((item) => item.product.id === product.id); return existing ? current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { product, quantity: 1 }]; }); }
  function changeQuantity(id, quantity) { setCartItems((current) => quantity < 1 ? current.filter((item) => item.product.id !== id) : current.map((item) => item.product.id === id ? { ...item, quantity: Math.min(quantity, 9) } : item)); }
  function removeFromCart(id) { setCartItems((current) => current.filter((item) => item.product.id !== id)); }
  function toggleFavorite(id) { setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]); }

  return <div className="app"><Header cartCount={cartCount} /><Routes><Route path="/" element={<HomePage />} /><Route path="/catalog" element={<CatalogPage favorites={favorites} onToggleFavorite={toggleFavorite} onAdd={addToCart} />} /><Route path="/catalog/:productId" element={<ProductPage onAdd={addToCart} />} /><Route path="/order" element={<OrderPage />} /><Route path="/cart" element={<CartPage items={cartItems} onChangeQuantity={changeQuantity} onRemove={removeFromCart} />} /><Route path="*" element={<NotFoundPage />} /></Routes><footer className="site-footer"><div><span className="brand brand--footer"><span className="brand__mark" aria-hidden="true">FH</span><span><strong>Fish</strong>Hunter</span></span><p>Учебный SPA-магазин аквариумных рыбок<br />на React + Vite.</p></div><span>© 2026 FishHunter</span></footer></div>;
}

export default App;
