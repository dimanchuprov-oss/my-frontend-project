/* FishHunter: интерактивность поверх локальных компонентов Bootstrap. */
(() => {
  'use strict';
  const products = window.ShopProducts;
  const byId = new Map(products.map((product) => [product.id, product]));
  const params = new URLSearchParams(location.search);
  const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
  const money = (value) => currency.format(value);
  const $ = (selector) => document.querySelector(selector);
  const storageKey = 'fishhunter-favorites-v1';
  let favorites = new Set();
  let storageAvailable = true;

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(stored)) favorites = new Set(stored.filter((id) => byId.has(id)));
  } catch { storageAvailable = false; }

  function toast(message) {
    $('#toastMessage').textContent = message;
    bootstrap.Toast.getOrCreateInstance($('#shopToast'), { delay: 4000 }).show();
  }

  function updateFavorites() {
    document.querySelectorAll('[data-favorite]').forEach((button) => {
      const product = byId.get(button.dataset.favorite);
      const selected = favorites.has(product.id);
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', `${selected ? 'Убрать из избранного' : 'В избранное'}: ${product.name}`);
    });
    document.querySelectorAll('.favorite-count').forEach((badge) => {
      badge.textContent = String(favorites.size);
      badge.hidden = favorites.size === 0;
    });
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-favorite]');
    if (!button) return;
    const id = button.dataset.favorite;
    if (!byId.has(id)) return;
    if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
    try { localStorage.setItem(storageKey, JSON.stringify([...favorites])); }
    catch { storageAvailable = false; }
    updateFavorites();
    toast(`${byId.get(id).name} ${favorites.has(id) ? 'добавлен в избранное' : 'удалён из избранного'}.${storageAvailable ? '' : ' Хранилище недоступно: выбор сохранён только до закрытия страницы.'}`);
    if ($('#onlyFavorites')?.checked) renderCatalog();
  });
  updateFavorites();

  // Быстрый просмотр: Bootstrap сам управляет фокусом, Escape и фоном.
  $('#quickViewModal').addEventListener('show.bs.modal', (event) => {
    const product = byId.get(event.relatedTarget?.dataset.quickView);
    if (!product) return;
    $('#quickViewTitle').textContent = product.name;
    const image = document.createElement('img');
    image.src = `images/${product.image}`;
    image.alt = product.name;
    image.className = 'modal-image mb-3';
    const description = document.createElement('p');
    description.textContent = product.desc;
    const price = document.createElement('p');
    price.className = 'product-price mb-1';
    price.textContent = money(product.price);
    const stock = document.createElement('p');
    stock.className = 'small text-muted mb-0';
    stock.textContent = `${product.unit} · ${product.stock ? 'В наличии' : 'Ожидается поступление'}`;
    $('#quickViewBody').replaceChildren(image, description, price, stock);
    const order = $('#quickViewOrder');
    order.textContent = product.stock ? 'Оставить заявку' : 'Посмотреть товар';
    order.href = product.stock ? `order.html?product=${product.id}` : `product.html?id=${product.id}`;
  });

  // Каталог: реальные фильтры, сортировка, страницы и сохраняемая в URL выборка.
  const filters = $('#catalogFilters');
  let currentPage = 1;
  const pageSize = 6;
  let catalogColumns = [];
  function renderCatalog() {
    if (!filters) return;
    const category = filters.elements.category.value;
    const group = $('#productGroup').value;
    const search = $('#productSearch').value.trim().toLocaleLowerCase('ru');
    const maxPrice = Number($('#maxPrice').value);
    const inStock = $('#inStock').checked;
    const onlyFavorites = $('#onlyFavorites').checked;
    $('#priceOutput').textContent = money(maxPrice);
    const matches = products.filter((p) => (category === 'all' || p.category === category)
      && (group === 'all' || p.group === group)
      && `${p.name} ${p.latin} ${p.tag}`.toLocaleLowerCase('ru').includes(search)
      && p.price <= maxPrice && (!inStock || p.stock) && (!onlyFavorites || favorites.has(p.id)));
    const sort = $('#sortProducts').value;
    if (sort === 'price-asc') matches.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') matches.sort((a, b) => b.price - a.price);
    if (sort === 'name') matches.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    const pageCount = Math.ceil(matches.length / pageSize);
    currentPage = Math.max(1, Math.min(currentPage, pageCount || 1));
    const visible = matches.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const visibleIds = new Set(visible.map((p) => p.id));
    catalogColumns.forEach((column) => { column.hidden = !visibleIds.has(column.dataset.id); });
    // Перестановка существующих узлов сохраняет обработчики и состояние избранного.
    matches.forEach((p) => $('#productGrid').append(catalogColumns.find((column) => column.dataset.id === p.id)));
    $('#resultCount').textContent = matches.length
      ? `Найдено: ${matches.length} · Показаны ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, matches.length)}`
      : 'Найдено: 0';
    $('#emptyResults').hidden = matches.length > 0;
    $('#catalogPagination').replaceChildren();
    if (pageCount > 1) {
      const makePage = (label, page, disabled, active = false) => {
        const item = document.createElement('li');
        item.className = `page-item${active ? ' active' : ''}${disabled ? ' disabled' : ''}`;
        const button = document.createElement('button');
        button.className = 'page-link';
        button.type = 'button';
        button.textContent = label;
        button.disabled = disabled;
        button.setAttribute('aria-label', label === '‹' ? 'Предыдущая страница' : label === '›' ? 'Следующая страница' : `Страница ${page}`);
        if (active) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', () => {
          currentPage = page;
          renderCatalog();
          $('#catalogPagination [aria-current="page"]').focus();
        });
        item.append(button);
        $('#catalogPagination').append(item);
      };
      makePage('‹', currentPage - 1, currentPage === 1);
      for (let page = 1; page <= pageCount; page++) makePage(String(page), page, false, page === currentPage);
      makePage('›', currentPage + 1, currentPage === pageCount);
    }
    const url = new URL(location.href);
    url.search = '';
    if (category !== 'all') url.searchParams.set('category', category);
    if (group !== 'all') url.searchParams.set('group', group);
    if (search) url.searchParams.set('search', $('#productSearch').value.trim());
    if (maxPrice < 6000) url.searchParams.set('price', String(maxPrice));
    if (inStock) url.searchParams.set('stock', '1');
    if (onlyFavorites) url.searchParams.set('favorites', '1');
    if (sort !== 'popular') url.searchParams.set('sort', sort);
    if (currentPage > 1) url.searchParams.set('page', String(currentPage));
    try { history.replaceState(null, '', url); } catch { /* file:// может ограничивать history */ }
  }

  if (filters) {
    catalogColumns = [...document.querySelectorAll('.product-column')];
    const category = params.get('category');
    if (['fish', 'sets', 'equipment'].includes(category)) filters.elements.category.value = category;
    const group = params.get('group');
    if ([...$('#productGroup').options].some((option) => option.value === group)) $('#productGroup').value = group;
    $('#productSearch').value = params.get('search') || '';
    if (params.has('price') && Number.isFinite(Number(params.get('price')))) $('#maxPrice').value = params.get('price');
    $('#inStock').checked = params.get('stock') === '1';
    $('#onlyFavorites').checked = params.get('favorites') === '1';
    if (['price-asc', 'price-desc', 'name'].includes(params.get('sort'))) $('#sortProducts').value = params.get('sort');
    const page = Number(params.get('page'));
    if (Number.isInteger(page) && page > 0) currentPage = page;
    filters.addEventListener('input', (event) => {
      if (event.target.name === 'category') $('#productGroup').value = 'all';
      currentPage = 1;
      renderCatalog();
    });
    filters.addEventListener('submit', (event) => event.preventDefault());
    filters.addEventListener('reset', () => {
      setTimeout(() => { currentPage = 1; $('#sortProducts').value = 'popular'; renderCatalog(); }, 0);
    });
    $('#sortProducts').addEventListener('change', () => { currentPage = 1; renderCatalog(); });
    $('#resetEmpty').addEventListener('click', () => filters.reset());
    document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
      $('#productGrid').classList.toggle('catalog-list', button.dataset.view === 'list');
      document.querySelectorAll('[data-view]').forEach((item) => {
        item.classList.toggle('active', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
    }));
    renderCatalog();
  }

  // Страница товара получает только известный id из справочника.
  if ($('#productDetail')) {
    const id = params.get('id') || 'neon';
    const p = byId.get(id);
    if (!p) {
      const error = document.createElement('div');
      error.className = 'alert alert-warning';
      const title = document.createElement('h1');
      title.className = 'h3'; title.textContent = 'Товар не найден';
      const link = document.createElement('a');
      link.href = 'catalog.html'; link.textContent = 'Вернуться в каталог';
      error.append(title, link);
      $('#productDetail').replaceChildren(error);
      document.title = 'Товар не найден — FishHunter';
    } else {
      document.title = `${p.name} — FishHunter`;
      $('meta[name="description"]').content = `${p.name}: ${p.desc}`;
      const image = $('#detailImage');
      image.src = `images/${p.image}`; image.alt = p.name;
      image.alt = p.category === 'equipment' ? `Пример оборудования: ${p.name}` : p.name;
      $('#detailImageNote').textContent = p.category === 'equipment'
        ? 'Фотография похожего оборудования для иллюстрации товара.'
        : 'Фото вида. Окраска конкретной рыбки может отличаться.';
      const fields = { detailTitle: p.name, detailCategory: p.tag, detailBadge: p.badge, detailLatin: p.latin,
        detailDescription: p.desc, detailLongDescription: p.desc, detailPrice: money(p.price),
        detailOldPrice: money(p.old), detailUnit: `Цена за ${p.unit}`, detailStock: p.stock ? 'В наличии' : 'Ожидается поступление' };
      Object.entries(fields).forEach(([id, text]) => { document.getElementById(id).textContent = text; });
      $('#detailBadge').hidden = !p.badge;
      $('#detailOldPrice').hidden = !p.old;
      $('#detailStock').classList.toggle('stock--out', !p.stock);
      const tbody = $('#detailSpecs'); tbody.replaceChildren();
      p.specs.forEach(([label, value]) => {
        const row = document.createElement('tr');
        const th = document.createElement('th'); th.scope = 'row'; th.className = 'fw-normal'; th.textContent = label;
        const td = document.createElement('td'); td.textContent = value;
        row.append(th, td); tbody.append(row);
      });
      const link = $('#detailOrder');
      const quantity = $('#detailQuantity');
      const updateLink = () => {
        const valid = quantity.checkValidity() && Number.isInteger(Number(quantity.value)) && quantity.value !== '';
        $('#detailQuantityError').hidden = valid;
        quantity.setAttribute('aria-invalid', String(!valid));
        if (p.stock && valid) {
          link.href = `order.html?product=${p.id}&quantity=${quantity.value}`;
          link.removeAttribute('aria-disabled');
          link.classList.remove('disabled');
        } else {
          link.removeAttribute('href');
          link.setAttribute('aria-disabled', 'true');
          link.classList.add('disabled');
        }
      };
      if (!p.stock) { link.textContent = 'Ожидается поступление'; quantity.disabled = true; }
      quantity.addEventListener('input', updateLink);
      link.addEventListener('click', (event) => { if (link.getAttribute('aria-disabled') === 'true') event.preventDefault(); });
      updateLink();
    }
  }

  const form = $('#orderForm');
  if (form) {
    const productInput = $('#orderProduct');
    const quantityInput = $('#orderQuantity');
    const address = $('#orderAddress');
    const date = $('#orderDate');
    const now = new Date();
    date.min = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const requested = byId.get(params.get('product'));
    if (requested?.stock) productInput.value = requested.id;
    const requestedQuantity = Number(params.get('quantity'));
    if (Number.isInteger(requestedQuantity) && requestedQuantity >= 1 && requestedQuantity <= 20) quantityInput.value = String(requestedQuantity);
    if (params.has('product') && !requested?.stock) {
      const warning = document.createElement('p'); warning.className = 'alert alert-warning';
      warning.textContent = 'Товар из ссылки недоступен. Выберите другую позицию в форме.';
      form.prepend(warning);
    }
    function orderState() {
      const p = byId.get(productInput.value);
      const q = Number(quantityInput.value);
      const validQuantity = Number.isInteger(q) && q >= 1 && q <= 20;
      const delivery = $('#courier').checked ? 350 : 0;
      return { p, quantity: q, validQuantity, delivery, subtotal: validQuantity ? p.price * q : null,
        total: validQuantity ? p.price * q + delivery : null };
    }
    function updateSummary() {
      const s = orderState();
      const courier = $('#courier').checked;
      $('#addressField').hidden = !courier; address.disabled = !courier; address.required = courier;
      $('#summaryImage').src = `images/${s.p.image}`;
      $('#summaryName').textContent = s.p.name;
      $('#summaryUnit').textContent = s.p.unit;
      $('#summaryQuantity').textContent = s.validQuantity ? `Товар × ${s.quantity}` : 'Проверьте количество';
      $('#summarySubtotal').textContent = s.subtotal === null ? '—' : money(s.subtotal);
      $('#summaryDelivery').textContent = s.delivery ? money(s.delivery) : 'Бесплатно';
      $('#summaryTotal').textContent = s.total === null ? '—' : money(s.total);
      $('#commentCount').textContent = `${$('#orderComment').value.length} / 500`;
    }
    function validateCustomFields() {
      const name = $('#orderName');
      name.setCustomValidity((name.value.trim().match(/\p{L}/gu) || []).length >= 2 ? '' : 'Введите имя: не менее двух букв.');
      const phone = $('#orderPhone');
      // Российский код страны уже показан в input-group, вводятся 10 цифр номера.
      const normalizedPhone = phone.value.replace(/[\s()\-]/g, '');
      phone.setCustomValidity(/^\d{10}$/.test(normalizedPhone) ? '' : 'Введите 10 цифр после +7.');
      address.setCustomValidity(!address.required || address.value.trim().length >= 8 ? '' : 'Укажите полный адрес.');
      quantityInput.setCustomValidity(orderState().validQuantity ? '' : 'Введите целое число от 1 до 20.');
      productInput.setCustomValidity(byId.get(productInput.value)?.stock ? '' : 'Выберите доступный товар.');
      date.setCustomValidity(!date.value || date.value >= date.min ? '' : 'Дата не может быть в прошлом.');
    }
    function markValidity() {
      form.querySelectorAll('input, select, textarea').forEach((field) => {
        if (field.willValidate) field.setAttribute('aria-invalid', String(!field.validity.valid));
      });
    }
    function clearMessages() {
      $('#formError').hidden = true; $('#formSuccess').hidden = true;
    }
    form.addEventListener('input', () => {
      clearMessages(); updateSummary(); validateCustomFields();
      if (form.classList.contains('was-validated')) markValidity();
    });
    form.addEventListener('change', () => { updateSummary(); validateCustomFields(); });
    form.addEventListener('reset', () => {
      setTimeout(() => {
        form.classList.remove('was-validated');
        form.querySelectorAll('input, select, textarea').forEach((field) => { field.setCustomValidity(''); field.removeAttribute('aria-invalid'); });
        $('#reviewSummary').replaceChildren();
        clearMessages(); updateSummary();
      }, 0);
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault(); clearMessages(); validateCustomFields();
      form.classList.add('was-validated'); markValidity();
      if (!form.checkValidity()) {
        $('#formError').hidden = false;
        form.querySelector(':invalid:not(fieldset)')?.focus();
        return;
      }
      const s = orderState();
      const details = [ ['Товар', `${s.p.name} × ${s.quantity}`], ['Имя', $('#orderName').value.trim()],
        ['E-mail', $('#orderEmail').value.trim()], ['Телефон', `+7 ${$('#orderPhone').value.trim()}`],
        ['Получение', s.delivery ? 'Доставка' : 'Самовывоз'],
        ...(s.delivery ? [['Адрес', address.value.trim()]] : []),
        ...(date.value ? [['Дата связи', date.value.split('-').reverse().join('.')]] : []),
        ['Способ связи', $('#orderContact').selectedOptions[0].textContent],
        ...($('#orderComment').value.trim() ? [['Комментарий', $('#orderComment').value.trim()]] : []),
        ['Итого', money(s.total)] ];
      const summary = $('#reviewSummary'); summary.replaceChildren();
      details.forEach(([label, text]) => {
        const dt = document.createElement('dt'); dt.className = 'small text-muted fw-normal'; dt.textContent = label;
        const dd = document.createElement('dd'); dd.className = 'text-break'; dd.textContent = text;
        summary.append(dt, dd);
      });
      bootstrap.Modal.getOrCreateInstance($('#reviewModal')).show();
    });
    $('#confirmOrder').addEventListener('click', () => {
      validateCustomFields();
      if (!form.checkValidity()) { bootstrap.Modal.getInstance($('#reviewModal')).hide(); return; }
      const s = orderState();
      $('#reviewModal').addEventListener('hidden.bs.modal', () => {
        const success = $('#formSuccess');
        success.textContent = `Демозаявка проверена: ${s.p.name} × ${s.quantity}, итог ${money(s.total)}. Данные никуда не отправлены и не сохранены.`;
        success.hidden = false; success.focus();
        $('#reviewSummary').replaceChildren();
      }, { once: true });
      bootstrap.Modal.getInstance($('#reviewModal')).hide();
      toast('Проверка завершена. Это демонстрация без отправки данных.');
    });
    $('#orderFields').disabled = false;
    updateSummary();
  }
})();
