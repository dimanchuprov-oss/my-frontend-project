function FormField({ label, name, type = 'text', value, onChange, error, placeholder, required = true }) {
  const id = `order-${name}`;
  return (
    <label className={`field form-field${error ? ' form-field--error' : ''}`} htmlFor={id}>
      <span>{label}{required && <b aria-hidden="true"> *</b>}</span>
      <input id={id} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
      {error && <small id={`${id}-error`} className="field-error" role="alert">{error}</small>}
    </label>
  );
}

export default FormField;
