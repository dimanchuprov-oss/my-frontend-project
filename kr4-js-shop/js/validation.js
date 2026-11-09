const orderForm = document.querySelector('#order-form');
const selectedProductField = document.querySelector('#selected-product');
const successMessage = document.querySelector('#success-message');
const formError = document.querySelector('#form-error');
const feedbackForm = document.querySelector('#feedback-form');
const feedbackSuccess = document.querySelector('#feedback-success');
const feedbackError = document.querySelector('#feedback-error');

function hideOrderMessages() {
  if (successMessage) successMessage.hidden = true;
  if (formError) {
    formError.hidden = true;
    formError.textContent = '';
  }
}

function populateOrderProducts() {
  if (!selectedProductField || selectedProductField.tagName !== 'SELECT') return;
  while (selectedProductField.options.length > 1) {
    selectedProductField.remove(1);
  }
  products.forEach((product) => {
    const option = document.createElement('option');
    option.value = String(product.id);
    option.textContent = product.title;
    selectedProductField.append(option);
  });
  const requestedProduct = new URLSearchParams(window.location.search).get('product');
  if (products.some((product) => String(product.id) === requestedProduct)) {
    selectedProductField.value = requestedProduct;
  }
}

if (orderForm) {
  populateOrderProducts();
  orderForm.addEventListener('reset', hideOrderMessages);
  orderForm.addEventListener('input', hideOrderMessages);
  orderForm.addEventListener('change', hideOrderMessages);
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideOrderMessages();
    if (!orderForm.checkValidity()) {
      formError.textContent = 'Проверьте обязательные поля, адрес электронной почты и телефон.';
      formError.hidden = false;
      orderForm.reportValidity();
      return;
    }
    const selectedProductValue = selectedProductField.value;
    orderForm.reset();
    selectedProductField.value = selectedProductValue;
    successMessage.hidden = false;
  });
}

if (feedbackForm) {
  const hideFeedbackMessages = () => {
    feedbackSuccess.hidden = true;
    feedbackError.hidden = true;
    feedbackError.textContent = '';
  };
  feedbackForm.addEventListener('reset', hideFeedbackMessages);
  feedbackForm.addEventListener('input', hideFeedbackMessages);
  feedbackForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideFeedbackMessages();
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
