import { Link } from 'react-router-dom';

function NotFoundPage() {
  return <main id="main-content" className="page-shell"><div className="empty-state empty-state--page not-found"><span className="not-found__number">404</span><h1>Страница потерялась в глубине</h1><p>Такого адреса нет. Вернитесь к нашим рыбкам и начните поиск заново.</p><Link className="button" to="/">На главную</Link></div></main>;
}

export default NotFoundPage;
