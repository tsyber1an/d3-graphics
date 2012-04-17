var Graphs = Graphs || {};

Graphs.DistributionView = Backbone.d3.Canned.BarWithLine.View.extend({
    initialize: function(){
        this.setElement($(QuanConfiguration.templates['graphs/distribution']()));

        var percent = new CDF.Percent();
        this.formView = new Forms.DistributionView({model: percent});
        percent.set({percent_left: 1, percent_right: 2, percent_middle: 3});  

        var $editable = {    
          	sum : { 
          		left: this.formView.$("#left_hand.sum"),
          		right: this.formView.$("#right_hand.sum"),
          		middle: this.formView.$("#middle_hand.sum")
          	},
          	pc : {
          		left: this.formView.$("#percent_left"),
          		right: this.formView.$("#percent_right"),
          		middle: this.formView.$("#percent_middle")
          	},      	
          	sigma : this.formView.$("#sigma")     	    
        };
                
        var $applyButtons = { pc: this.formView.$("#applyForPc"), sum: this.formView.$("#applyForSum") };
        
        var sides = ['left', 'right']; //except middle

        _.each(sides, function(side){
          var otherSide = sides[sides.length - 1 - sides.indexOf(side)];
        
          FormValidation.onlyNonNegativeNumbers.apply($editable.sum[side]);
          FormValidation.onlyNonNegativeNumbers.apply($editable.pc[side]);
          
          $editable.pc[side].bind("keyup", function(e){
            var val = this.value;
            
            if( val.length > 0 ){
             var total = (parseFloat(val) + parseFloat($editable.pc[otherSide].val()) 
                            + parseFloat($editable.pc['middle'].val())).toFixed(1); 
             total > 100 ? (this.value = 0) : null
            }
          });      
          
        });        
        
        var settings = {
          height: 280, // svg area
          width: 565,  // svg area
          barHeight: 200,      
          barWidth: 21,
          size: 100,
          container: this.$('#bar_plot_with_slider')[0],
          lineDomain: { x : 2, y : 2 },
          barDomain:  { x : 0.8, y : 100 },
          userPercent : { left : 5, right : 55 },
          callBackId : $applyButtons,
          cdfCallBackOutput : $editable
        };

        Backbone.d3.Canned.BarWithLine.View.prototype.initialize.apply(this, [this.model, settings]);
    },
    
    render: function(){
      var form = this.formView.render().el;
      this.$el.append(form);
      return this;
    }
});
