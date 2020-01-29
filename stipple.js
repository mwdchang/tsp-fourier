/**
 * @param {array} data - greyscale image array with data [0, 1]
 */
function stipple(data, imageWidth, imageHeight, options) {
  const sampleSize = options.sampleSize || 1;
  const sampleThreshold = options.sampleThreshold || 1.0;
  const result = [];

  for (let y = 0; y < imageHeight; y+= sampleSize ) {
    for (let x = 0; x < imageWidth; x+= sampleSize) {

      let s = 0;
      for (let i = 0; i < sampleSize; i++) {
        for (let j=0; j < sampleSize; j++) {
          const start = (y + i) * imageWidth;
          s += data[start + x + j];
        }
      }
      s /= (sampleSize * sampleSize);
      if (s < sampleThreshold) {
        result.push({
          x: x + Math.random(),  
          y: y + Math.random(),
          value: s
        });
      }
    }
  }
  return { result };
}
