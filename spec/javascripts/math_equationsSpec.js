describe('Converting between polar and Cartesian coordinates', function(){
  it("should correctly calculate angle", function(){
    var x = 12, y = 5;
    
    var angle = MathEquation.polarAngel( x, y ).toFixed(1);
      
    expect(angle).toEqual(22.6);
  });      
});
