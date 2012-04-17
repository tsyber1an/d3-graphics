var Forms = Forms || {};

Forms.DoughnutView = Backbone.View.extend({
  initialize: function(){
    this.setElement($(QuanConfiguration.templates['graphs/doughnutForm']()));
  },
  
  render : function(){
    return this;
  }

});
