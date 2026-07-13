const TEMP_BOTTLE_IMAGE = "/images/tempbottle_image.png";

function fallbackOilImageSrc(src) {
  return src && src !== TEMP_BOTTLE_IMAGE ? TEMP_BOTTLE_IMAGE : src || TEMP_BOTTLE_IMAGE;
}

module.exports = {
  TEMP_BOTTLE_IMAGE,
  fallbackOilImageSrc,
};
