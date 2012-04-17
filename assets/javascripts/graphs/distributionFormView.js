var CDF = CDF || {};

CDF.Percent = Backbone.Model.extend({});
CDF.Sum = Backbone.Model.extend({});

var Forms = Forms || {};

Forms.DistributionView = Backbone.View.extend({
  initialize: function(){
    this.setElement($(QuanConfiguration.templates['graphs/distributionForm']()));
  },
  
  render : function(){
    return this;
  }

});
