function DFT(values) {
  const results = [];
  const N = values.length;

  for (let freq = 0; freq < N; freq++) {
    let re = 0;
    let im = 0;

    for (let n = 0; n < N; n++) {
      const phi = (2 * Math.PI * freq ) * (n / N);
      re += values[n] * Math.cos(phi);
      im -= values[n] * Math.sin(phi);
    }
    re = re / N;
    im = im / N;

    const amp = Math.sqrt(re * re + im * im); // r
    const phase = Math.atan2(im, re); // angle
    results.push({
      re: re,
      im: im,
      freq: freq,
      amp: amp,
      phase: phase
    });
  }
  return results;
}

