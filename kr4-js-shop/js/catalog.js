const productsContainer = document.querySelector('#products-container');
const catalogSearch = document.querySelector('#catalog-search');
const categoryFilter = document.querySelector('#category-filter');
const sortSelect = document.querySelector('#sort-select');
const priceFrom = document.querySelector('#price-from');
const priceTo = document.querySelector('#price-to');
const availableOnly = document.querySelector('#available-only');
const favoritesOnly = document.querySelector('#favorites-only');
const catalogControls = document.querySelector('#catalog-controls');
const catalogSummary = document.querySelector('#catalog-summary');
const catalogEmpty = document.querySelector('#catalog-empty');
const storageStatus = document.querySelector('#catalog-storage-status');
const favoritesStorageKey = 'fishhunter-favorites';

function readFavoriteIds() {
  try {
    const storedFavorites = localStorage.getItem(favoritesStorageKey);
    if (!storedFavorites) return new Set();
    const parsedFavorites = JSON.parse(storedFavorites);
    if (!Array.isArray(parsedFavorites)) {
      throw new TypeError('Список избранного должен быть массивом.');
    }
    return new Set(parsedFavorites
      .map(Number)
      .filter((id) => products.some((product) => product.id === id)));
  } catch (error) {
    storageStatus.textContent = 'Не удалось прочитать избранное из браузера; список начат заново.';
    console.error('Ошибка чтения избранного:', error);
    return new Set();
  }
}

const catalogState = {
  query: '',
  category: 'all',
  sort: 'default',
  minPrice: '',
  maxPrice: '',
  availableOnly: false,
  favoritesOnly: false,
  favoriteIds: readFavoriteIds()
};

function formatPrice(price) {
  return `${new Intl.NumberFormat('ru-RU').format(price)} руб.`;
}

function searchProducts(items, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');
  if (!normalizedQuery) return items;
  return items.filter((product) => product.title.toLocaleLowerCase('ru-RU').includes(normalizedQuery));
}

function filterProductsByCategory(items, category) {
  return category === 'all' ? items : items.filter((product) => product.category === category);
}

function sortProducts(items, sortType) {
  const sortedItems = [...items];
  if (sortType === 'price-asc') return sortedItems.sort((a, b) => a.price - b.price);
  if (sortType === 'price-desc') return sortedItems.sort((a, b) => b.price - a.price);
  if (sortType === 'title-asc') return sortedItems.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  return sortedItems;
}

function getPreparedProducts() {
  let result = searchProducts(products, catalogState.query);
  result = filterProductsByCategory(result, catalogState.category);
  result = result.filter((product) => {
    const matchesMinPrice = catalogState.minPrice === '' || product.price >= Number(catalogState.minPrice);
    const matchesMaxPrice = catalogState.maxPrice === '' || product.price <= Number(catalogState.maxPrice);
    const matchesAvailability = !catalogState.availableOnly || product.isAvailable;
    const matchesFavorites = !catalogState.favoritesOnly || catalogState.favoriteIds.has(product.id);
    return matchesMinPrice && matchesMaxPrice && matchesAvailability && matchesFavorites;
  });
  return sortProducts(result, catalogState.sort);
}

function createProductCard(product) {
  const card = document.createElement('article');
  card.classList.add('product-card');
  if (product.rating >= 4.8) card.classList.add('product-card--featured');

  const image = document.createElement('img');
  image.classList.add('product-card__image');
  image.src = product.image;
  image.srcset = product.imageSrcset;
  image.sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw';
  image.alt = product.imageAlt;
  image.loading = 'lazy';
  image.decoding = 'async';

  const category = document.createElement('p');
  category.classList.add('product-card__category');
  category.textContent = product.categoryName;

  const title = document.createElement('h3');
  title.classList.add('product-card__title');
  title.textContent = product.title;

  const description = document.createElement('p');
  description.classList.add('product-card__description');
  description.textContent = product.description;

  const price = document.createElement('p');
  price.classList.add('product-card__price');
  price.textContent = product.discountPercent
    ? `${formatPrice(product.price)} · скидка ${product.discountPercent}%`
    : formatPrice(product.price);

  const details = document.createElement('p');
  details.classList.add('product-card__meta');
  details.textContent = `Рейтинг: ${product.rating.toFixed(1)} из 5`;

  const status = document.createElement('p');
  status.classList.add('product-card__status');
  status.textContent = product.isAvailable ? 'В наличии' : 'Временно нет в наличии';

  const actions = document.createElement('div');
  actions.classList.add('product-card__actions');

  const favoriteButton = document.createElement('button');
  favoriteButton.classList.add('button', 'button--secondary', 'favorite-button');
  favoriteButton.type = 'button';
  favoriteButton.dataset.action = 'toggle-favorite';
  favoriteButton.dataset.productId = String(product.id);
  favoriteButton.setAttribute('aria-pressed', String(catalogState.favoriteIds.has(product.id)));
  favoriteButton.textContent = catalogState.favoriteIds.has(product.id) ? 'Убрать из избранного' : 'В избранное';
  actions.append(favoriteButton);

  if (product.isAvailable) {
    const orderLink = document.createElement('a');
    orderLink.classList.add('button', 'product-card__button');
    orderLink.href = `order.html?product=${encodeURIComponent(product.id)}`;
    orderLink.textContent = 'Оформить заявку';
    actions.append(orderLink);
  }

  card.append(image, category, title, description, price, details, status, actions);
  return card;
}

function renderProducts(items) {
  productsContainer.replaceChildren();
  items.forEach((product) => productsContainer.append(createProductCard(product)));
  catalogSummary.textContent = `Найдено: ${items.length} из ${products.length}. Средняя цена каталога: ${formatPrice(
    Math.round(products.reduce((sum, product) => sum + product.price, 0) / products.length)
  )}`;
  catalogEmpty.hidden = items.length > 0;
}

function updateCatalog() {
  renderProducts(getPreparedProducts());
}

function populateCategories() {
  const categories = new Map(products.map((product) => [product.category, product.categoryName]));
  categories.forEach((name, value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = name;
    categoryFilter.append(option);
  });
}

function saveFavoriteIds() {
  try {
    localStorage.setItem(favoritesStorageKey, JSON.stringify([...catalogState.favoriteIds]));
    storageStatus.textContent = 'Избранное сохранено в этом браузере.';
  } catch (error) {
    storageStatus.textContent = 'Браузер не разрешил сохранить избранное; оно доступно только до закрытия страницы.';
    console.error('Ошибка сохранения избранного:', error);
  }
}

if (productsContainer && catalogControls) {
  populateCategories();
  catalogControls.addEventListener('input', () => {
    catalogState.query = catalogSearch.value;
    catalogState.minPrice = priceFrom.value;
    catalogState.maxPrice = priceTo.value;
    catalogState.availableOnly = availableOnly.checked;
    catalogState.favoritesOnly = favoritesOnly.checked;
    updateCatalog();
  });
  catalogControls.addEventListener('change', () => {
    catalogState.category = categoryFilter.value;
    catalogState.sort = sortSelect.value;
    catalogState.minPrice = priceFrom.value;
    catalogState.maxPrice = priceTo.value;
    catalogState.availableOnly = availableOnly.checked;
    catalogState.favoritesOnly = favoritesOnly.checked;
    updateCatalog();
  });
  catalogControls.addEventListener('reset', () => {
    catalogState.query = '';
    catalogState.category = 'all';
    catalogState.sort = 'default';
    catalogState.minPrice = '';
    catalogState.maxPrice = '';
    catalogState.availableOnly = false;
    catalogState.favoritesOnly = false;
    window.setTimeout(updateCatalog);
  });
  productsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="toggle-favorite"]');
    if (!button) return;
    const productId = Number(button.dataset.productId);
    if (!products.some((product) => product.id === productId)) {
      console.error(`Не найден товар с идентификатором ${productId}.`);
      return;
    }
    if (catalogState.favoriteIds.has(productId)) {
      catalogState.favoriteIds.delete(productId);
    } else {
      catalogState.favoriteIds.add(productId);
    }
    saveFavoriteIds();
    updateCatalog();
  });
  updateCatalog();
}
