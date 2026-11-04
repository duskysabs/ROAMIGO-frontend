export const PHONE_NUMBER_PATTERN = /^\+63\d{10}$/;

export function isValidPhoneNumber(value: string): boolean {
  return PHONE_NUMBER_PATTERN.test(value);
}
