export const formatNumberToIDR = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export const formatPriceRange = (prices) => {
  if (!prices || typeof prices !== "object") {
    return "Price not set";
  }

  const priceValues = Object.values(prices)
    .map((price) => Number(price))
    .filter((price) => !isNaN(price) && price > 0);

  if (priceValues.length === 0) {
    return "Price not set";
  }

  const minPrice = Math.min(...priceValues);
  const maxPrice = Math.max(...priceValues);

  if (minPrice === maxPrice) {
    return formatNumberToIDR(minPrice);
  }
  return `${formatNumberToIDR(minPrice)} - ${formatNumberToIDR(maxPrice)}`;
};
