function CatalogControls({ filters, categories, onChange, onReset, resultCount }) {
  return (
    <section className="catalog-controls" aria-labelledby="filters-title">
      <div className="catalog-controls__heading">
        <div>
          <p className="eyebrow">Настройте выдачу</p>
          <h2 id="filters-title">Найдите свою рыбку</h2>
        </div>
        <span className="result-count">Найдено: <strong>{resultCount}</strong></span>
      </div>
      <div className="control-grid">
        <label className="field field--search">
          <span>Поиск по названию</span>
          <input type="search" value={filters.query} onChange={(event) => onChange('query', event.target.value)} placeholder="Например, неон" />
        </label>
        <label className="field">
          <span>Категория</span>
          <select value={filters.category} onChange={(event) => onChange('category', event.target.value)}>
            <option value="all">Все категории</option>
            {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Сортировка</span>
          <select value={filters.sort} onChange={(event) => onChange('sort', event.target.value)}>
            <option value="default">По популярности</option>
            <option value="price-asc">Сначала дешевле</option>
            <option value="price-desc">Сначала дороже</option>
            <option value="title">По названию А-Я</option>
          </select>
        </label>
        <label className="field field--compact">
          <span>Цена от, ₽</span>
          <input type="number" min="0" value={filters.minPrice} onChange={(event) => onChange('minPrice', event.target.value)} placeholder="0" />
        </label>
        <label className="field field--compact">
          <span>Цена до, ₽</span>
          <input type="number" min="0" value={filters.maxPrice} onChange={(event) => onChange('maxPrice', event.target.value)} placeholder="∞" />
        </label>
      </div>
      <div className="control-footer">
        <label className="checkbox-label">
          <input type="checkbox" checked={filters.onlyAvailable} onChange={(event) => onChange('onlyAvailable', event.target.checked)} />
          <span>Только в наличии</span>
        </label>
        <button className="text-button" type="button" onClick={onReset}>Сбросить фильтры</button>
      </div>
    </section>
  );
}

export default CatalogControls;
