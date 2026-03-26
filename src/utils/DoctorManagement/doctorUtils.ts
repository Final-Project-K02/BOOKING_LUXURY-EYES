import {
  DEFAULT_PRICE,
  PRICE_TIERS,
} from "../../constants/admin/doctorConstants";

/** Tính giá khám tự động dựa vào số năm kinh nghiệm */
export const getPriceByExperience = (experienceYear: number): number => {
  const tier = PRICE_TIERS.find((t) => experienceYear <= t.maxYear);
  return tier ? tier.price : DEFAULT_PRICE;
};
