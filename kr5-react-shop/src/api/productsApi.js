const PRODUCTS_URL = '/products.json';

export async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Не удалось загрузить данные (${response.status}).`);
  }
  return response.json();
}

export async function getProducts(options = {}) {
  const products = await requestJson(PRODUCTS_URL, options);
  if (!Array.isArray(products)) {
    throw new Error('Источник товаров вернул данные в неверном формате.');
  }
  return products;
}

export async function getProductById(productId, options = {}) {
  const products = await getProducts(options);
  return products.find((product) => String(product.id) === String(productId)) ?? null;
}
