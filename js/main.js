// JS использует id и data-атрибуты, поэтому БЭМ-рефакторинг не ломает поведение.
const dialog = document.querySelector('#order-dialog');
const form = document.querySelector('#order-form');
const selectedProduct = document.querySelector('#selected-product');
const productLabel = document.querySelector('#selected-product-label');
const successMessage = document.querySelector('#success-message');
const formError = document.querySelector('#form-error');

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
  if (!dialog && ['1', '2', '3'].includes(productId)) {
    selectedProduct.value = `Товар ${productId}`;
  }
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
