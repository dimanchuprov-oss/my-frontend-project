// JS использует id и data-атрибуты, поэтому БЭМ-рефакторинг не ломает поведение.
const dialog = document.querySelector('#order-dialog');
const form = document.querySelector('#order-form');
const selectedProduct = document.querySelector('#selected-product');
const productLabel = document.querySelector('#selected-product-label');
const successMessage = document.querySelector('#success-message');
const formError = document.querySelector('#form-error');
const feedbackForm = document.querySelector('#feedback-form');
const feedbackSuccess = document.querySelector('#feedback-success');
const feedbackError = document.querySelector('#feedback-error');
const navigationToggle = document.querySelector('#site-nav-toggle');
const navigationList = document.querySelector('#site-nav-list');

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

function resetMessages() {
  if (successMessage) successMessage.hidden = true;
  if (formError) {
    formError.hidden = true;
    formError.textContent = '';
  }
}

if (dialog && form) {
  document.querySelectorAll('[data-product]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedProduct.value = button.dataset.product;
      productLabel.textContent = `Выбран: ${button.dataset.product}`;
      resetMessages();
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

if (form) {
  // Принимаем только известные значения из ссылки на страницу заявки.
  const productId = new URLSearchParams(window.location.search).get('product');
  const productsById = { '1': 'Неоны', '2': 'Золотая рыбка', '3': 'Гуппи' };
  if (!dialog && productsById[productId]) selectedProduct.value = productsById[productId];
  form.addEventListener('reset', resetMessages);
  form.addEventListener('input', resetMessages);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    resetMessages();
    if (!form.checkValidity()) {
      formError.textContent = 'Проверьте обязательные поля формы.';
      formError.hidden = false;
      form.reportValidity();
      return;
    }
    const product = selectedProduct.value;
    form.reset();
    selectedProduct.value = product;
    successMessage.hidden = false;
  });
}

if (feedbackForm) {
  const resetFeedbackMessages = () => {
    feedbackSuccess.hidden = true;
    feedbackError.hidden = true;
    feedbackError.textContent = '';
  };

  feedbackForm.addEventListener('reset', resetFeedbackMessages);
  feedbackForm.addEventListener('input', resetFeedbackMessages);
  feedbackForm.addEventListener('submit', (event) => {
    event.preventDefault();
    resetFeedbackMessages();
    if (!feedbackForm.checkValidity()) {
      feedbackError.textContent = 'Проверьте имя, адрес электронной почты и сообщение.';
      feedbackError.hidden = false;
      feedbackForm.reportValidity();
      return;
    }
    feedbackForm.reset();
    feedbackSuccess.hidden = false;
  });
}
