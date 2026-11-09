const dialog = document.querySelector('#order-dialog');
const dialogForm = document.querySelector('#order-form');
const dialogProduct = document.querySelector('#selected-product');
const productLabel = document.querySelector('#selected-product-label');
const navigationToggle = document.querySelector('#site-nav-toggle');
const navigationList = document.querySelector('#site-nav-list');
const cartCount = document.querySelector('#cart-count');

function updateCartBadge(items) {
  if (!cartCount) return;
  const count = getCartItemCount(items);
  cartCount.textContent = String(count);
  cartCount.setAttribute('aria-label', `Товаров в корзине: ${count}`);
}

function refreshCartBadge() {
  const result = readCart();
  updateCartBadge(result.items);
  if (result.error) {
    const status = document.querySelector('#catalog-storage-status, #cart-storage-status');
    if (status) {
      status.textContent = 'Не удалось прочитать сохранённую корзину. Проверьте данные в хранилище браузера.';
    }
  }
}

refreshCartBadge();
window.addEventListener('storage', (event) => {
  if (event.key === cartStorageKey) refreshCartBadge();
});

if (navigationToggle && navigationList) {
  const mobileNavigation = window.matchMedia('(max-width: 900px)');
  const navigationLabel = navigationToggle.querySelector('.site-nav__label');

  function setNavigationExpanded(expanded) {
    navigationList.hidden = !expanded;
    navigationToggle.setAttribute('aria-expanded', String(expanded));
    navigationLabel.textContent = expanded ? 'Закрыть меню' : 'Меню';
  }

  setNavigationExpanded(!mobileNavigation.matches);
  navigationToggle.addEventListener('click', () => {
    setNavigationExpanded(navigationList.hidden);
  });
  navigationList.addEventListener('click', (event) => {
    if (mobileNavigation.matches && event.target.closest('a')) {
      setNavigationExpanded(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNavigation.matches && !navigationList.hidden) {
      setNavigationExpanded(false);
      navigationToggle.focus();
    }
  });
  mobileNavigation.addEventListener('change', (event) => {
    setNavigationExpanded(!event.matches);
  });
  window.addEventListener('resize', () => {
    setNavigationExpanded(!mobileNavigation.matches);
  });
}

if (dialog && dialogForm && dialogProduct && productLabel) {
  document.querySelectorAll('[data-product]').forEach((button) => {
    button.addEventListener('click', () => {
      dialogProduct.value = button.dataset.product;
      productLabel.textContent = `Выбран: ${button.dataset.product}`;
      dialog.querySelector('#success-message').hidden = true;
      const errorMessage = dialog.querySelector('#form-error');
      errorMessage.hidden = true;
      errorMessage.textContent = '';
      dialog.showModal();
    });
  });
  document.querySelector('#close-order-dialog').addEventListener('click', () => dialog.close());
  document.querySelector('#cancel-order-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (event.target === dialog && outside) dialog.close();
  });
}
