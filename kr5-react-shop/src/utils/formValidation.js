const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9\s()-]{10,}$/;

export function validateOrderForm(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Введите имя.';
  if (!emailPattern.test(values.email.trim())) errors.email = 'Введите корректный e-mail.';
  if (!phonePattern.test(values.phone.trim())) errors.phone = 'Введите телефон из 10 и более цифр.';
  if (!values.product.trim()) errors.product = 'Укажите товар или выберите его в каталоге.';
  if (!values.agree) errors.agree = 'Нужно согласиться с обработкой заявки.';
  return errors;
}
