import React from 'react';

const FloatingInput = ({ label, type = 'text', value, onChange, required = false, id, ...props }) => {
  return (
    <div className="floating-input-group">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        className="peer"
        {...props}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export const FloatingTextarea = ({ label, value, onChange, required = false, id, rows = 3, ...props }) => {
  return (
    <div className="floating-input-group">
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder=" "
        required={required}
        rows={rows}
        className="peer min-h-[80px]"
        {...props}
      />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export const FloatingSelect = ({ label, value, onChange, children, id, ...props }) => {
  return (
    <div className="floating-input-group">
      <select
        id={id}
        value={value}
        onChange={onChange}
        className="peer"
        {...props}
      >
        {children}
      </select>
      <label htmlFor={id}>{label}</label>
    </div>
  );
};

export default FloatingInput;
