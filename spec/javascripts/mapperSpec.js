describe('Fraction segment', function(){
  it("should create fraction segment", function(){
    var t = toFractionalSegment([10,20], 10);
    var res = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    
    expect(t).toEqual(res);
  });
  
  it("should create fraction segment with correct fixed", function(){
    var t = toFractionalSegment([5, 9], 3);
    var res = [5, 6.3, 7.6, 8.9];
    
    expect(t).toEqual(res);
  });
  
  it("should have segment length equal to step", function(){
    var step = 5;
  
    var t = toFractionalSegment([3, 7], step);
   
    expect(t.length).toEqual(step+1);
  });      
});

describe('mapper', function () {
  it("should", function(){
    var sourceSegment = [100, 200], 
        targetSegment = [10, 20], 
        value = 150;
    
    var imageValue = mapper( sourceSegment, targetSegment, value );
    expect(imageValue).toEqual(14);
  });  
  
  it("should", function(){
    var sourceSegment = [1000, 2000], 
        targetSegment = [3, 7], 
        value = 1500;
    
    var imageValue = mapper( sourceSegment, targetSegment, value, { step : 5 } );
    expect(imageValue).toEqual(4.6);
  });
  
  it("should", function(){
    var sourceSegment = [100, 200], 
        targetSegment = [10, 20], 
        value = 151;
    
    var imageValue = mapper( sourceSegment, targetSegment, value );
    expect(imageValue).toEqual(15);
  });      
}); 
