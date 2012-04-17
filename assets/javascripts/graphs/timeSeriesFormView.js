var Forms = Forms || {};

Forms.TimeSeriesView = Backbone.View.extend({
  initialize: function(){
    this.setElement($(QuanConfiguration.templates['graphs/timeSeriesForm']()));
  },
  
  render : function(){
    return this;
  }

});
