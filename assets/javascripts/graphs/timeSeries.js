var TimeSeries = Backbone.d3.PlotCollection.extend({
  url: function(){ return '/graphs/time_series.json'; }
});
