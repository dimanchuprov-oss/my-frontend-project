import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../api/productsApi';
import { formatPrice } from '../utils/productUtils';

function HomePage() {
  const [featured, setFeatured] = useState([]);
  useEffect(() => {
    const controller = new AbortController();
    getProducts({ signal: controller.signal }).then((products) => setFeatured(products.slice(0, 3))).catch((error) => {
      if (error.name !== 'AbortError') setFeatured([]);
    });
    return () => controller.abort();
  }, []);

  return <main id="main-content" className="page-shell home-page">
    <section className="hero-section">
      <div className="hero-section__content"><p className="eyebrow">Аквариум начинается с заботы</p><h1>Живой цвет<br /><em>вашего дома</em></h1><p className="hero-section__lead">Подбираем здоровых аквариумных рыбок и помогаем создать гармоничный подводный мир.</p><Link className="button button--large" to="/catalog">Смотреть каталог <span aria-hidden="true">→</span></Link></div>
      <div className="hero-section__visual" aria-label="Иллюстрация аквариума"><div className="bubble bubble--one" /><div className="bubble bubble--two" /><div className="bubble bubble--three" /><img src="/images/neon-tetra.jpg" alt="Неон-тетра в аквариуме" /></div>
    </section>
    <section className="benefits-section" aria-labelledby="benefits-title"><div><span className="benefit-icon">✦</span><h2 id="benefits-title">Почему FishHunter</h2><p>Мы делаем знакомство с аквариумистикой понятным и приятным.</p></div><div className="benefit-list"><div><strong>10+</strong><span>видов рыбок</span></div><div><strong>4.8</strong><span>средний рейтинг</span></div><div><strong>24 ч</strong><span>ответ на заявку</span></div></div></section>
    <section className="featured-section" aria-labelledby="featured-title"><div className="section-heading"><div><p className="eyebrow">Выбор команды</p><h2 id="featured-title">Популярные жители</h2></div><Link className="inline-link" to="/catalog">Весь каталог <span aria-hidden="true">→</span></Link></div><div className="mini-products">{featured.map((product) => <Link className="mini-product" to={`/catalog/${product.id}`} key={product.id}><img src={product.image} alt="" /><div><strong>{product.title}</strong><span>{formatPrice(product.price)}</span></div><span aria-hidden="true">↗</span></Link>)}</div></section>
  </main>;
}

export default HomePage;
