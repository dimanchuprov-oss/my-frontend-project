import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import FormField from '../components/FormField';
import { validateOrderForm } from '../utils/formValidation';

const emptyForm = { name: '', email: '', phone: '', product: '', comment: '', agree: false };
const DRAFT_KEY = 'fishhunter-order-draft';

function OrderPage() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(() => { try { return { ...emptyForm, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') }; } catch { return emptyForm; } });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); }, [form]);
  useEffect(() => { const productId = searchParams.get('product'); if (productId && !form.product) setForm((current) => ({ ...current, product: `Товар №${productId}` })); }, [searchParams, form.product]);
  function update(event) { const { name, value, checked, type } = event.target; setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })); setSubmitted(false); }
  function submit(event) { event.preventDefault(); const nextErrors = validateOrderForm(form); setErrors(nextErrors); if (!Object.keys(nextErrors).length) setSubmitted(true); }
  function clearDraft() { setForm(emptyForm); setErrors({}); setSubmitted(false); localStorage.removeItem(DRAFT_KEY); }

  return <main id="main-content" className="page-shell order-page"><div className="page-intro"><p className="eyebrow">Свяжитесь с нами</p><h1>Заявка на<br /><em>подбор рыбок</em></h1><p>Расскажите о своём аквариуме, и мы предложим подходящих жителей.</p></div><div className="order-layout"><form className="order-form" onSubmit={submit} noValidate><div className="form-grid"><FormField label="Ваше имя" name="name" value={form.name} onChange={update} error={errors.name} placeholder="Дмитрий" /><FormField label="E-mail" name="email" type="email" value={form.email} onChange={update} error={errors.email} placeholder="you@example.com" /><FormField label="Телефон" name="phone" type="tel" value={form.phone} onChange={update} error={errors.phone} placeholder="+7 900 000-00-00" /><FormField label="Интересующий товар" name="product" value={form.product} onChange={update} error={errors.product} placeholder="Например, неон-тетра" /></div><label className={`field form-field${errors.comment ? ' form-field--error' : ''}`} htmlFor="order-comment"><span>Комментарий</span><textarea id="order-comment" name="comment" value={form.comment} onChange={update} placeholder="Размер аквариума, желаемое количество и любые вопросы" rows="5" /></label><label className="checkbox-label checkbox-label--form"><input name="agree" type="checkbox" checked={form.agree} onChange={update} /><span>Согласен на обработку данных для ответа на заявку.</span></label>{errors.agree && <p className="field-error" role="alert">{errors.agree}</p>}{submitted && <div className="message message--success" role="status">Заявка подготовлена. Мы свяжемся с вами в течение рабочего дня.</div>}<div className="form-actions"><button className="button button--large" type="submit">Отправить заявку <span aria-hidden="true">→</span></button><button className="text-button" type="button" onClick={clearDraft}>Очистить черновик</button></div></form><aside className="order-aside"><div className="aside-number">01</div><h2>Что будет дальше?</h2><ol><li>Изучим вашу заявку и пожелания.</li><li>Подберём рыбок, совместимых с вашим аквариумом.</li><li>Ответим на e-mail или телефон.</li></ol><Link className="inline-link" to="/catalog">Сначала посмотреть каталог →</Link></aside></div></main>;
}

export default OrderPage;
