//= require './lib/jquery/js/jquery-1.7.1.js'
//= require './lib/js/underscore.js'
//= require './lib/js/backbone.js'
//= require_tree ./lib
//= require './bindingConventions.js'

//= require handlebars
//= require_tree ../templates
//= require './quanConfiguration.js'
//= require './main.js'

//= require ./graphs/backbone-d3.js
//= require ./graphs/visualisations/bar_with_line.js
//= require ./graphs/visualisations/line.js
//= require ./graphs/visualisations/pie.js
//= require ./graphs/mapper.js
//= require ./graphs/formValidation.js
//= require ./graphs/distributionFormView.js
//= require ./graphs/distributionGraphView.js
//= require ./graphs/distributions.js
//= require ./graphs/math_equations.js
//= require ./graphs/timeSeriesFormView.js
//= require ./graphs/timeSeriesGraphView.js
//= require ./graphs/timeSeries.js
//= require ./graphs/doughnutFormView.js
//= require ./graphs/doughnutGraphView.js
//= require ./graphs/doughnut.js

var AppRouter = Backbone.Router.extend({
    initialize: function(options){
        this.route('graphs/distributions', 'distribution', this.distribution);
        this.route('graphs/time_series', 'timeSeries', this.timeSeries);
        this.route('graphs/doughnut', 'doughnut', this.doughnut);        
    },

    distribution: function(){
        var model = new Distributions();                
        var view = new Graphs.DistributionView({model: model});       
        Main.render(view, model);  
    },
    
    timeSeries: function(){
        var model = new TimeSeries();                
        var view = new Graphs.TimeSeriesView({model: model});       
        Main.render(view, model);      
    },
    
    doughnut: function(){
        var model = new Doughnut();                
        var view = new Graphs.DoughnutView({model: model});       
        Main.render(view, model);      
    }
});
$(document).ready(function(){
    Backbone.history || (Backbone.history = new Backbone.History);
    var newApp = new AppRouter();
    Backbone.history.start({pushState: true});
});
