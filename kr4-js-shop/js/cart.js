const cartItemsContainer = document.querySelector('#cart-items');
const cartEmpty = document.querySelector('#cart-empty');
const cartSummary = document.querySelector('#cart-summary');
const cartStorageStatus = document.querySelector('#cart-storage-status');
const clearCartButton = document.querySelector('#clear-cart');

function formatCartPrice(price) {
  return `${new Intl.NumberFormat('ru-RU').format(price)} руб.`;
}

function createCartRow(product, quantity) {
  const row = document.createElement('article');
  row.classList.add('cart-item');

  const image = document.createElement('img');
  image.classList.add('cart-item__image');
  image.src = product.image;
  image.srcset = product.imageSrcset;
  image.sizes = '(max-width: 700px) 96px, 128px';
  image.alt = product.imageAlt;
  image.loading = 'lazy';

  const details = document.createElement('div');
  details.classList.add('cart-item__details');

  const title = document.createElement('h2');
  title.classList.add('cart-item__title');
  title.textContent = product.title;

  const unitPrice = document.createElement('p');
  unitPrice.classList.add('cart-item__price');
  if (product.discountPercent > 0) {
    const oldPrice = document.createElement('del');
    oldPrice.textContent = formatCartPrice(product.price);
    const discountedPrice = document.createElement('strong');
    discountedPrice.textContent = formatCartPrice(getDiscountedPrice(product));
    const discount = document.createElement('span');
    discount.classList.add('cart-item__discount');
    discount.textContent = `Скидка ${product.discountPercent}%`;
    unitPrice.append(oldPrice, discountedPrice, discount);
  } else {
    unitPrice.textContent = formatCartPrice(product.price);
  }

  const lineTotal = document.createElement('p');
  lineTotal.classList.add('cart-item__total');
  lineTotal.textContent = `Сумма: ${formatCartPrice(getDiscountedPrice(product) * quantity)}`;
  details.append(title, unitPrice, lineTotal);

  const controls = document.createElement('div');
  controls.classList.add('cart-item__controls');
  const decrease = document.createElement('button');
  decrease.classList.add('button', 'button--secondary');
  decrease.type = 'button';
  decrease.dataset.cartAction = 'decrease';
  decrease.dataset.productId = String(product.id);
  decrease.setAttribute('aria-label', `Уменьшить количество: ${product.title}`);
  decrease.disabled = quantity === 1;
  decrease.textContent = '−';

  const quantityLabel = document.createElement('span');
  quantityLabel.classList.add('cart-item__quantity');
  quantityLabel.textContent = String(quantity);
  quantityLabel.setAttribute('aria-label', `Количество: ${quantity}`);

  const increase = document.createElement('button');
  increase.classList.add('button', 'button--secondary');
  increase.type = 'button';
  increase.dataset.cartAction = 'increase';
  increase.dataset.productId = String(product.id);
  increase.setAttribute('aria-label', `Увеличить количество: ${product.title}`);
  increase.textContent = '+';

  const remove = document.createElement('button');
  remove.classList.add('button', 'button--secondary', 'cart-item__remove');
  remove.type = 'button';
  remove.dataset.cartAction = 'remove';
  remove.dataset.productId = String(product.id);
  remove.textContent = 'Удалить';
  controls.append(decrease, quantityLabel, increase, remove);
  row.append(image, details, controls);
  return row;
}

function renderCart() {
  const result = readCart();
  cartItemsContainer.replaceChildren();
  cartStorageStatus.textContent = result.error
    ? 'Не удалось прочитать корзину из localStorage. Очистите её и добавьте товары снова.'
    : '';

  let total = 0;
  let savings = 0;
  result.items.forEach((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) return;
    total += getDiscountedPrice(product) * item.quantity;
    savings += (product.price - getDiscountedPrice(product)) * item.quantity;
    cartItemsContainer.append(createCartRow(product, item.quantity));
  });

  const itemCount = getCartItemCount(result.items);
  cartEmpty.hidden = itemCount > 0;
  cartSummary.hidden = itemCount === 0;
  clearCartButton.disabled = itemCount === 0 && !result.error;
  cartSummary.textContent = savings > 0
    ? `К оплате: ${formatCartPrice(total)} · Ваша экономия: ${formatCartPrice(savings)}`
    : `К оплате: ${formatCartPrice(total)}`;
}

function updateCart(items, productId, action) {
  const nextItems = items.map((item) => ({ ...item }));
  const itemIndex = nextItems.findIndex((item) => item.productId === productId);

  if (action === 'remove') {
    if (itemIndex !== -1) nextItems.splice(itemIndex, 1);
  } else if (itemIndex === -1 && action === 'increase') {
    nextItems.push({ productId, quantity: 1 });
  } else if (itemIndex !== -1 && action === 'increase') {
    nextItems[itemIndex].quantity += 1;
  } else if (itemIndex !== -1 && action === 'decrease') {
    if (nextItems[itemIndex].quantity > 1) nextItems[itemIndex].quantity -= 1;
  }

  const result = writeCart(nextItems);
  if (result.error) {
    cartStorageStatus.textContent = 'Не удалось сохранить изменения корзины. Проверьте настройки хранения браузера.';
    return;
  }
  updateCartBadge(nextItems);
  renderCart();
}

cartItemsContainer.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const productId = Number(button.dataset.productId);
  const action = button.dataset.cartAction;
  const result = readCart();
  if (result.error) {
    cartStorageStatus.textContent = 'Не удалось обновить корзину: сохранённые данные повреждены.';
    return;
  }
  updateCart(result.items, productId, action);
});

clearCartButton.addEventListener('click', () => {
  const result = writeCart([]);
  if (result.error) {
    cartStorageStatus.textContent = 'Не удалось очистить корзину. Проверьте настройки хранения браузера.';
    return;
  }
  updateCartBadge([]);
  renderCart();
});

window.addEventListener('storage', (event) => {
  if (event.key === cartStorageKey) renderCart();
});

renderCart();
