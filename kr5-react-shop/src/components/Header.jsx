import { NavLink } from 'react-router-dom';

function Header({ cartCount }) {
  const linkClass = ({ isActive }) => `site-nav__link${isActive ? ' site-nav__link--active' : ''}`;

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink className="brand" to="/" end aria-label="FishHunter, на главную">
          <span className="brand__mark" aria-hidden="true">FH</span>
          <span><strong>Fish</strong>Hunter</span>
        </NavLink>
        <nav className="site-nav" aria-label="Основная навигация">
          <NavLink className={linkClass} to="/" end>Главная</NavLink>
          <NavLink className={linkClass} to="/catalog">Каталог</NavLink>
          <NavLink className={linkClass} to="/order">Заявка</NavLink>
          <NavLink className={`${linkClass} site-nav__cart`} to="/cart">
            Корзина <span className="cart-badge" aria-label={`${cartCount} товаров в корзине`}>{cartCount}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

export default Header;
