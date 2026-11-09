const cartStorageKey = 'fishhunter-cart';

function getDiscountedPrice(product) {
  return Math.round(product.price * (100 - product.discountPercent) / 100);
}

function readCart() {
  try {
    const storedCart = localStorage.getItem(cartStorageKey);
    if (!storedCart) return { items: [], error: null };

    const parsedCart = JSON.parse(storedCart);
    if (!Array.isArray(parsedCart)) {
      throw new TypeError('Содержимое корзины должно быть массивом.');
    }

    const itemsById = new Map();
    parsedCart.forEach((item) => {
      const productId = Number(item.productId);
      const quantity = Number(item.quantity);
      const productExists = products.some((product) => product.id === productId);
      if (!productExists || !Number.isInteger(quantity) || quantity < 1) {
        throw new TypeError('В корзине найден товар или количество неверного формата.');
      }
      itemsById.set(productId, (itemsById.get(productId) || 0) + quantity);
    });

    const items = [...itemsById].map(([productId, quantity]) => ({ productId, quantity }));
    return { items, error: null };
  } catch (error) {
    console.error('Не удалось прочитать корзину:', error);
    return { items: [], error };
  }
}

function writeCart(items) {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(items));
    return { error: null };
  } catch (error) {
    console.error('Не удалось сохранить корзину:', error);
    return { error };
  }
}

function getCartItemCount(items) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
