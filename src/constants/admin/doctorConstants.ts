// Ngưỡng kinh nghiệm → giá khám tự động
export const PRICE_TIERS = [
  { maxYear: 3, price: 150000 },
  { maxYear: 7, price: 250000 },
  { maxYear: 15, price: 350000 },
] as const;

export const DEFAULT_PRICE = 500000;

export const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const AVATAR_UPLOAD_FOLDER = "booking-app/doctors";
