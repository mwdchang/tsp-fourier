class ImageUtil {

  /**
   * Flattens a RGBA channel data into grey scale float array
   */
  static flatten(data, options) {
    const w = options.width || 0;
    const h = options.height || 0;

    const flat = [];

    for (let i = 0; i < w * h; ++i) {
      const j = i * 4;
      const newVal = (data[j+0] + data[j+1] + data[j+2] + data[j+3]) / 4.0 ;
      flat.push( newVal / 255.0 );
    }
    return flat;
  }

  /**
   * Unflatten single channel to RGBA
   */
  static unflatten(data, options) {
    const w = options.width || 0;
    const h = options.height || 0;
    const unflat = [];
    for (let i = 0; i < w * h; ++i) {
      const val = data[i];
      unflat.push(data[i] * 255);
      unflat.push(data[i] * 255);
      unflat.push(data[i] * 255);
      unflat.push(255);
    }
    return unflat;
  }


  static invert(data) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      result.push(1 - data[i]);
    }
    return result;
  }


  // See: https://www.freecodecamp.org/news/sketchify-turn-any-image-into-a-pencil-sketch-with-10-lines-of-code-cf67fa4f68ce/
  static dodge(front, back) {
    const result = [];
    for (let i = 0; i < front.length; i++) {
      let v = front[i] / (1.0 - back[i]);
      if (v > 1) v = 1;
      result.push(v);
    }
    return result;
  }


  /**
   * Load image data into RGBA numeric array, which is
   * somewhat compatible with tensor data structure
   *
   * @param {string} url - the image URL
   * @param {object} options
   * @param {number} options.width - optional, resize to specified width
   * @param {number} options.height - optional, resize to specified height 
   *
   * FIXME: reuse canvas element if available
   * FIXME: add option for channel filters
   */
  static async loadImage(url, options = {}) {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    window.ctx = ctx;

    const imgRequest = new Promise((resolve, reject) => {
      img.crossOrigin = '';
      img.onload = () => {
        img.width = options.width || img.naturalWidth;
        img.height = options.height || img.naturalHeight;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0 , 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // ctx.drawImage(img, 0, i * chunkSize, img.width, chunkSize, 0, 0, img.width, chunkSize);

        resolve(imageData);
      };
      img.src = url;
    });
    return imgRequest;
  }


  // Filters.convolute = function(pixels, weights, opaque) {


  // Adapted from https://www.html5rocks.com/en/tutorials/canvas/imagefilters/
  static convolve(data, options, weights) {
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side/2);
    const sw = options.width;
    const sh = options.height;
    const channels = options.channels;

    // pad output by the convolution matrix
    const w = sw;
    const h = sh;

    const result = [];
    // go through the destination image pixels
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // calculate the weighed sum of the source image pixels that
        // fall under the convolution matrix
        let ch = [];
        for (let c = 0; c < channels; c++) {
          ch.push(0);
        }

        // Not well defined around edges
        // if (y - halfSide < 0 || y + halfSide >= h || x - halfSide < 0 || x + halfSide >= w) {
        //   for (let c = 0; c < channels; c++) {
        //     ch[c] = data[(x * w + y) * channels];
        //   }
        // }

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            const scy = y + cy - halfSide;
            const scx = x + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              let srcOff = (scy * sw + scx) * channels;
              let wt = weights[cy * side + cx];

              for (let c = 0; c < channels; c++) {
                ch[c] += data[srcOff + c] * wt;
              }
            } else {
              // Not great ... but does the job
              for (let c = 0; c < channels; c++) {
                ch[c] += data[(y * w + x) * channels] * ( 1/ weights.length) * 0.28;
              }
            }
          }
        }
        for (let c = 0; c < channels; c++) {
          result.push(ch[c]);
        }
      }
    }
    return result;
  };


  // Should use with channel = 1
  static sobel(data, options) {
    const gx = [-1,  0,  1, -2, 0, 2, -1, 0, 1];
	  const gy = [-1, -2, -1,  0, 0, 0,  1, 2, 1];

    const gxResult = this.convolve(data, options, gx);
    const gyResult = this.convolve(data, options, gy);

    console.log('length', gxResult.length);
    console.log('length', gyResult.length);

    // Join
    const r = [];
    for (let i = 0; i < gxResult.length; i++) {
      const v = Math.sqrt( gxResult[i] * gxResult[i] + gyResult[i] * gyResult[i]);
      r.push(Math.min(1.0, v));
    }
    return r;
  }


  static blurGaussian = [
    0.00000067,0.00002292,0.00019117,0.00038771,0.00019117,0.00002292,0.00000067,
    0.00002292,0.00078633,0.00655965,0.01330373,0.00655965,0.00078633,0.00002292,
    0.00019117,0.00655965,0.05472157,0.11098164,0.05472157,0.00655965,0.00019117,
    0.00038771,0.01330373,0.11098164,0.22508352,0.11098164,0.01330373,0.00038771,
    0.00019117,0.00655965,0.05472157,0.11098164,0.05472157,0.00655965,0.00019117,
    0.00002292,0.00078633,0.00655965,0.01330373,0.00655965,0.00078633,0.00002292,
    0.00000067,0.00002292,0.00019117,0.00038771,0.00019117,0.00002292,0.00000067
  ];

  static blur5x5 = [
    1/25, 1/25, 1/25, 1/25, 1/25,
    1/25, 1/25, 1/25, 1/25, 1/25,
    1/25, 1/25, 1/25, 1/25, 1/25,
    1/25, 1/25, 1/25, 1/25, 1/25,
    1/25, 1/25, 1/25, 1/25, 1/25
  ];

  static blur3x3 = [
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9 
  ];

}
