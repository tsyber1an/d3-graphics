var MathEquation = MathEquation || {};

MathEquation.linearYcoordinate = function(x, x1, y1, x2, y2){
  return (y2 + ((y1 - y2)/(x1 - x2))*(x - x2));
};

MathEquation.polarAngel = function(x, y){
  var theta = Math.atan(y/x)*180/ Math.PI;

  if (x >= 0 && y >= 0) {
    theta = theta;
  } else if (x < 0 && y >= 0) {
    theta = 180 + theta;
  } else if (x < 0 && y < 0) {
    theta = 180 + theta;
  } else if (x > 0 && y < 0) {
    theta = 360 + theta;
  }    
  return theta;
};

MathEquation.polarRadius = function(x, y){
  return Math.sqrt( Math.pow(x, 2) + Math.pow(y, 2) );
};
