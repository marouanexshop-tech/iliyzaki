import { findPack } from "./packs";

export type OrderInput = {
  packId: string;
  fullName: string;
  address: string;
  city: string;
  phone: string;
};

export type OrderField = keyof OrderInput;
export type OrderErrors = Partial<Record<OrderField, string>>;

/** Letters (Arabic or Latin) and spaces. Nothing else — no digits, no symbols. */
const LETTERS_ONLY = /^[\p{L}\s]+$/u;

/** Latin and Arabic-Indic digits, so ٠٦ is caught the same as 06. */
const ANY_DIGIT = /[\d٠-٩]/u;

/** Only digits, spaces and a plus sign may be typed into the phone field. */
const PHONE_ALLOWED = /^[\d\s+]+$/;

const HAS_LETTER = /\p{L}/u;

/** 06XXXXXXXX · 07XXXXXXXX · 212XXXXXXXXX · +212XXXXXXXXX */
const MOROCCAN_PHONE = /^(?:0[67]\d{8}|\+?212[67]\d{8})$/;

/** Spaces only — dashes, dots and brackets are rejected rather than stripped. */
export const normalizePhone = (value: string) => value.replace(/\s/g, "");

export function validateOrder(input: OrderInput): OrderErrors {
  const errors: OrderErrors = {};

  if (!findPack(input.packId)) {
    errors.packId = "المرجو اختيار باقة.";
  }

  /* Character rules come before length, so the message names the real problem. */
  const fullName = input.fullName.trim();
  if (!fullName) {
    errors.fullName = "المرجو إدخال الاسم الكامل.";
  } else if (ANY_DIGIT.test(fullName)) {
    errors.fullName = "الاسم لا يمكن أن يحتوي على أرقام.";
  } else if (!LETTERS_ONLY.test(fullName)) {
    errors.fullName = "الاسم يجب أن يحتوي على حروف ومسافات فقط، بدون رموز.";
  } else if (fullName.length < 3) {
    errors.fullName = "الاسم قصير جدًا.";
  } else if (fullName.length > 60) {
    errors.fullName = "الاسم طويل جدًا.";
  }

  const address = input.address.trim();
  if (!address) {
    errors.address = "المرجو إدخال العنوان.";
  } else if (address.length < 5) {
    errors.address = "العنوان قصير جدًا، أضف الشارع والرقم.";
  } else if (address.length > 120) {
    errors.address = "العنوان طويل جدًا، اكتبه بشكل مختصر.";
  }

  const city = input.city.trim();
  if (!city) {
    errors.city = "المرجو إدخال المدينة.";
  } else if (ANY_DIGIT.test(city)) {
    errors.city = "المدينة لا يمكن أن تحتوي على أرقام.";
  } else if (!LETTERS_ONLY.test(city)) {
    errors.city = "المدينة يجب أن تحتوي على حروف ومسافات فقط، بدون رموز.";
  } else if (city.length < 2) {
    errors.city = "اسم المدينة قصير جدًا.";
  } else if (city.length > 40) {
    errors.city = "اسم المدينة طويل جدًا.";
  }

  const rawPhone = input.phone.trim();
  const phone = normalizePhone(rawPhone);
  if (!rawPhone) {
    errors.phone = "المرجو إدخال رقم الهاتف.";
  } else if (HAS_LETTER.test(rawPhone)) {
    errors.phone = "رقم الهاتف لا يمكن أن يحتوي على حروف.";
  } else if (!PHONE_ALLOWED.test(rawPhone)) {
    errors.phone = "رقم الهاتف يقبل الأرقام والمسافات وعلامة + فقط.";
  } else if (phone.lastIndexOf("+") > 0) {
    errors.phone = "علامة + يجب أن تكون في بداية الرقم فقط.";
  } else if (!MOROCCAN_PHONE.test(phone)) {
    errors.phone = "الرقم يجب أن يبدأ بـ 06 أو 07 أو 212 أو +212. مثال: 0612345678";
  }

  return errors;
}

export const hasErrors = (errors: OrderErrors) => Object.keys(errors).length > 0;
