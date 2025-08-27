export function normalizePrice(price) {
  // If already in Shopware array format, return as-is
  if (
    Array.isArray(price) &&
    typeof price[0]?.gross === "number" &&
    typeof price[0]?.net === "number"
  ) {
    return price;
  }

  // Accept numeric or [numeric]; mirror gross=net for simplicity
  const numeric = Array.isArray(price) ? price[0] : price;
  if (typeof numeric !== "number")
    throw new Error("price must be a number or a Shopware price array");

  return [
    {
      // Default EUR currency id in a fresh SW install; replace if yours differs
      currencyId: "b7d2554b0ce847cd82f3ac9bd1c0dfca",
      gross: numeric,
      net: numeric,
      linked: true,
    },
  ];
}
