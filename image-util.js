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
    var w = sw;
    var h = sh;

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
        if (y - halfSide < 0 || y + halfSide >= h || x - halfSide < 0 || x + halfSide >= w) {
          for (let c = 0; c < channels; c++) {
            ch[c] = data[(y * w + x) * channels];
          }
        }

        for (let cy = 0; cy < side; cy++) {
          for (let cx = 0; cx < side; cx++) {
            var scy = y + cy - halfSide;
            var scx = x + cx - halfSide;
            if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
              let srcOff = (scy * sw + scx) * channels;
              let wt = weights[cy * side + cx];

              for (let c = 0; c < channels; c++) {
                ch[c] += data[srcOff + c] * wt;
              }

              /*
              r += data[srcOff] * wt;
              g += data[srcOff+1] * wt;
              b += data[srcOff+2] * wt;
              a += data[srcOff+3] * wt;
              */
            }
          }
        }
        /*
        dst[dstOff] = r;
        dst[dstOff + 1] = g;
        dst[dstOff + 2] = b;
        dst[dstOff + 3] = a;
        */
        for (let c = 0; c < channels; c++) {
          result.push(ch[c]);
        }
      }
    }
    return result;
  };
}