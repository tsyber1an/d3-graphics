var Graphs = Graphs || {};

Graphs.DoughnutView = Backbone.d3.Canned.Pie.View.extend({
  initialize: function(){
    this.setElement($(QuanConfiguration.templates['graphs/doughnut']()));

    this.formView = new Forms.DoughnutView();    
    
    var $outputs = {
      rotationDegree: this.formView.$('#doughnut_form .rotation_degree')
    };
    
    FormValidation.onlyNonNegativeNumbers.apply($outputs.rotationDegree);
    
    var $applyButtons = { 
      slider: this.formView.$("#doughnut_form .apply")
    };
    
    var settings = {
      width: 300,
      hieght: 300,
      radius: 200,
      container: this.$('#doughnut')[0],
      dataOutput: $outputs,
      editTriggers: $applyButtons
    };    
    Backbone.d3.Canned.Pie.View.prototype.initialize.apply(this, [this.model, settings]);
  },
  
  render: function(){
    var form = this.formView.render().el;
    this.$el.append(form);  
    return this;
  }
});
