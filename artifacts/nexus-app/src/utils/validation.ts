/**
 * Validaciones comunes
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateRegistration = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  profession: string;
  acceptTerms: boolean;
}): ValidationResult => {
  const errors: string[] = [];

  if (!data.firstName.trim()) errors.push('El nombre es requerido');
  if (!data.lastName.trim()) errors.push('El apellido es requerido');
  if (!data.email.trim()) errors.push('El correo es requerido');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('El correo no es válido');
  }
  if (data.password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres');
  if (data.password !== data.confirmPassword) errors.push('Las contraseñas no coinciden');
  if (!data.country) errors.push('El país es requerido');
  if (!data.profession) errors.push('La profesión es requerida');
  if (!data.acceptTerms) errors.push('Debes aceptar los términos y condiciones');

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateLogin = (data: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!data.email.trim()) errors.push('El correo es requerido');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('El correo no es válido');
  }
  if (!data.password) errors.push('La contraseña es requerida');

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePatient = (data: {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  phone?: string;
  email?: string;
}): ValidationResult => {
  const errors: string[] = [];

  if (!data.firstName.trim()) errors.push('El nombre del paciente es requerido');
  if (!data.lastName.trim()) errors.push('El apellido del paciente es requerido');

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('El correo del paciente no es válido');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
