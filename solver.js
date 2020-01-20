const dist2 = (p1, p2) => {
  return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
}
/**
 * Simple nearest neighbour solver
 */
function nearestNeighbour(points) {
  const result = [];

  let p = points.shift();
  result.push(p);

  const len = points.length;
  for (let j = 0; j < len; j++ ){
    let cmax = Number.POSITIVE_INFINITY;
    let index = -1;
    for (let i = 0; i < points.length; i++ ){
      const distance = dist2(p, points[i]);
      if ( distance <=  cmax) {
        cmax = distance;
        index = i;
      }
    }
    p = points.splice(index, 1)[0];
    result.push(p);
  }
  return result;
}
