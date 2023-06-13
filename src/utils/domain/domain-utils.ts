const pixelsToDomain = (
  pixels: number,
  minPixels: number,
  maxPixels: number,
  minDomain: number,
  maxDomain: number
) => {
  return (
    ((pixels - minPixels) / (maxPixels - minPixels)) * (maxDomain - minDomain) +
    minDomain
  );
};

const domainToPixels = (
  domain: number,
  minDomain: number,
  maxDomain: number,
  minPixels: number,
  maxPixels: number
) => {
  return (
    ((domain - minDomain) / (maxDomain - minDomain)) * (maxPixels - minPixels) +
    minPixels
  );
};

export { pixelsToDomain, domainToPixels };
