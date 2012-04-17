Graphs.TimeSeriesView = Backbone.d3.Canned.Line.View.extend({
  initialize: function(){
    this.setElement($(QuanConfiguration.templates['graphs/timeSeries']()));

    this.formView = new Forms.TimeSeriesView();    
    
    var $outputs = {
      circle: {
        x: this.formView.$("#circle_points .x"),
        y: this.formView.$("#circle_points .y")
      },
      slider: this.formView.$("#slider_form .x")
    };
    
    var $applyButtons = { 
      slider: this.formView.$("#slider_form .apply")
    };
    
    var settings = {
      width: 450,
      height: 275,
      padding: 20,
      container: this.$('#time_series')[0],
      dataOutput: $outputs,
      editTriggers: $applyButtons
    };    
        
    Backbone.d3.Canned.Line.View.prototype.initialize.apply(this, [this.model, settings]);
  },
  
  render: function(){
    var form = this.formView.render().el;
    this.$el.append(form);  
    return this;
  }
});
