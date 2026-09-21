const dialog = document.querySelector('#order-dialog');
const form = document.querySelector('#order-form');
const selectedProduct = document.querySelector('#selected-product');
const successMessage = document.querySelector('#success-message');
const formError = document.querySelector('#form-error');

function resetMessages() {
  successMessage.hidden = true;
  formError.hidden = true;
  formError.textContent = '';
}

document.querySelectorAll('.product-card__button').forEach((button) => {
  button.addEventListener('click', () => {
    selectedProduct.value = button.dataset.product || '';
    resetMessages();
    dialog.showModal();
  });
});

document.querySelector('#close-order-dialog').addEventListener('click', () => dialog.close());
document.querySelector('#cancel-order-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

form.addEventListener('submit', (event) => {
  event.preventDefault();
  resetMessages();
  if (!form.checkValidity()) {
    form.reportValidity();
    formError.textContent = 'Проверьте обязательные поля формы.';
    formError.hidden = false;
    return;
  }
  successMessage.hidden = false;
  form.reset();
  selectedProduct.value = '';
});
