export function getFinalPrice(product) {
  return Math.round(product.price * (1 - (product.discountPercent ?? 0) / 100));
}

export function formatPrice(price) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price);
}

export function getCategories(products) {
  return products.reduce((categories, product) => {
    if (!categories.some((category) => category.value === product.category)) {
      categories.push({ value: product.category, label: product.categoryName });
    }
    return categories;
  }, []);
}

export function getPreparedProducts(products, { query = '', category = 'all', sort = 'default', onlyAvailable = false, minPrice = '', maxPrice = '' } = {}) {
  const normalizedQuery = query.trim().toLocaleLowerCase('ru-RU');
  const lowerBound = minPrice === '' ? 0 : Number(minPrice);
  const upperBound = maxPrice === '' ? Number.POSITIVE_INFINITY : Number(maxPrice);
  const filtered = products.filter((product) => {
    const matchesQuery = product.title.toLocaleLowerCase('ru-RU').includes(normalizedQuery);
    const matchesCategory = category === 'all' || product.category === category;
    const matchesAvailability = !onlyAvailable || product.isAvailable;
    const matchesMin = Number.isNaN(lowerBound) || product.price >= lowerBound;
    const matchesMax = Number.isNaN(upperBound) || product.price <= upperBound;
    return matchesQuery && matchesCategory && matchesAvailability && matchesMin && matchesMax;
  });

  return [...filtered].sort((first, second) => {
    if (sort === 'price-asc') return getFinalPrice(first) - getFinalPrice(second);
    if (sort === 'price-desc') return getFinalPrice(second) - getFinalPrice(first);
    if (sort === 'title') return first.title.localeCompare(second.title, 'ru');
    return first.id - second.id;
  });
}
