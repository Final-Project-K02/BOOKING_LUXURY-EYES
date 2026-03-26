/** Chuẩn hoá status về uppercase để so sánh nhất quán */
export const normalizeStatus = (status?: string): string =>
  (status || "").trim().toUpperCase();

/** Tính % an toàn, tránh chia cho 0 */
export const calcPercent = (value: number, total: number): number =>
  total > 0 ? Math.round((value / total) * 100) : 0;
