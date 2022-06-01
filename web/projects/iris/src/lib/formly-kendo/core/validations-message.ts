export function minlengthValidationMessage(err, field) {
  return `Should have atleast ${field.templateOptions.minLength} characters`;
}

export function maxlengthValidationMessage(err, field) {
  return `This value should be less than ${field.templateOptions.maxLength} characters`;
}

export function minValidationMessage(err, field) {
  return `Should have atleast ${field.templateOptions.min} characters`;
}

export function maxValidationMessage(err, field) {
  return `This value should be less than ${field.templateOptions.max} characters`;
}

export function requiredValidationMessage(err, field) {
  return `This field is required`;
}

export function patternValidation(err, field) {
  return `This fields accepts only numbers`;
}
