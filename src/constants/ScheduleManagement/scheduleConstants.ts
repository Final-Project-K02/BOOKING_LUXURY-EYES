export const ROOMS = Array.from({ length: 11 }, (_, i) => ({
  id: 300 + i,
  name: `Phòng ${300 + i}`,
}));

export const FIXED_BLOCK_TIME_MINUTES = 30;
export const MIN_SLOT_GAP_MINUTES = 30;

const generateTimeOptions = () => {
  const options: { value: string; label: string }[] = [];
  // Ca sáng: 07:30 - 11:30
  for (let h = 7; h <= 11; h++) {
    const startMin = h === 7 ? 30 : 0;
    for (let m = startMin; m < 60; m += 30) {
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      options.push({ value: t, label: t });
    }
  }
  // Ca chiều: 13:30 - 17:30
  for (let h = 13; h <= 17; h++) {
    const startMin = h === 13 ? 30 : 0;
    const endMin = h === 17 ? 30 : 60;
    for (let m = startMin; m < endMin; m += 30) {
      const t = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      options.push({ value: t, label: t });
    }
  }
  return options;
};

export const TIME_OPTIONS = generateTimeOptions();
