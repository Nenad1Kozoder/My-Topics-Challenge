export const sentimentColor = (score: number): string => {
  if (score > 60) return "green";
  if (score < 40) return "red";
  return "gray";
};

export const getFontSize = (
  volume: number,
  minVol: number,
  maxVol: number
): number => {
  const sizes = [16, 24, 32, 40, 48, 56];
  const step = (maxVol - minVol) / sizes.length;
  const index = Math.min(
    sizes.length - 1,
    Math.floor((volume - minVol) / step)
  );
  return sizes[index];
};
