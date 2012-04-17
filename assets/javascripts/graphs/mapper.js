if (!Number.toFixed) {
  Number.prototype.toFixed = function(n){
    return Math.round(this*Math.pow(10, n)) / Math.pow(10, n);
  }
}

var toFractionalSegment = function( segment, fractionStep ){
  var a = segment[0],
      b = segment[1],
      step = ((b - a)/fractionStep).toFixed(1),
      i,
      fractionalSegment = [];
      
  for( i = 0; i <= fractionStep; i += 1 )
  {
    var t = a + i * step;
    if( t > b ){
      break;
    }
    fractionalSegment.push( t );
  }       
  
  return fractionalSegment;
};

// Find image of value
var mapper = function( sourceSegment, targetSegment, value, options){
  var step = (options && options.step) || 10,
      targetReversed = targetSegment[0] > targetSegment[1];
      
  if( targetReversed ){
    targetSegment = [targetSegment[1], targetSegment[0]]
  }   
        
  var sourceFracSeg = toFractionalSegment( sourceSegment, step ),
      targetFracSeg = toFractionalSegment( targetSegment, step );  
  
  // Find value in source and pick that an index as candidate
  var i, candidateIndex;
  for( i=0; i < step; i++ ){
    if( sourceFracSeg[i] < value && value <= sourceFracSeg[i+1] ){
      candidateIndex = i;
      break;
    }
  }

  var valueImage = targetFracSeg[ targetReversed ? step - candidateIndex : candidateIndex ];
  
  return valueImage;
}
