var DataPoint = Backbone.Model.extend({
  initialize: function(point) {
    this.set({
        x: point.x,
        y: point.y
    });
  }
});

var Distributions = Backbone.d3.Canned.BarWithLine.Collection.extend({
  model : DataPoint,
  url: function(){ return '/graphs/distributions.json'; }
});
