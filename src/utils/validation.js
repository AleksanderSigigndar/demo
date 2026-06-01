export const validateLogin = (login) => {
  const regex = /^[a-zA-Z0-9]{6,}$/;
  return regex.test(login);
};

export const validatePassword = (password) => {
  return password.length >= 8;
};

export const validatePhone = (phone) => {
  const regex = /^\+?\d{10,12}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

export const validateEmail = (email) => {
  return email.includes('@') && email.includes('.');
};

export const validateDate = (dateStr) => {
  const parts = dateStr.split('.');
  if (parts.length !== 3) return false;
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parseInt(parts[2]);
  const date = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
};