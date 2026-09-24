/**
 * Indian ID & Form Field Validation Utilities for AgriTradeX
 */

// Mobile Number: 10 digits starting with 6, 7, 8, or 9
export const isValidIndianMobile = (mobile) => {
  if (!mobile) return false;
  const cleaned = mobile.trim();
  return /^[6-9]\d{9}$/.test(cleaned);
};

// Aadhaar Number: Exactly 12 digits (ignoring spaces if entered with spaces)
export const isValidAadhaar = (aadhaar) => {
  if (!aadhaar) return false;
  const cleaned = aadhaar.replace(/\s+/g, '').trim();
  return /^\d{12}$/.test(cleaned);
};

// PAN Card Number: 5 uppercase letters, 4 numbers, 1 uppercase letter (e.g. ABCDE1234F)
export const isValidPAN = (pan) => {
  if (!pan) return false;
  const cleaned = pan.trim().toUpperCase();
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleaned);
};

// Pincode: Exactly 6 digits (Indian postal code)
export const isValidPincode = (pincode) => {
  if (!pincode) return false;
  const cleaned = pincode.trim();
  return /^[1-9][0-9]{5}$/.test(cleaned);
};

// Positive numeric check (for land acres)
export const isValidPositiveNumber = (num) => {
  if (num === '' || num === null || num === undefined) return false;
  const val = Number(num);
  return !isNaN(val) && val > 0;
};

// Non-empty string check
export const isNonEmpty = (val) => {
  if (val === null || val === undefined) return false;
  return String(val).trim().length > 0;
};
