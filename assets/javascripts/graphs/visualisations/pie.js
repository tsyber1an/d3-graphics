Backbone.d3.Canned['Pie'] = {
  Collection: Backbone.d3.PlotCollection.extend({
    initialize: function(models, settings) {
      Backbone.d3.PlotCollection.prototype.initialize.apply(this, [models, settings]);
    },
    
    plottype: "pie",
    
    parse: function(response){
      return response.data;
    }
  }),

  View: Backbone.d3.PlotView.extend({
    initialize: function(collection, settings) {
      Backbone.d3.PlotView.prototype.initialize.apply(this, [collection, settings]);
      
      this.width = settings.width || 300;
      this.height = settings.height || 300;
      this.radius = settings.radius || 100;
      this.dataOutput = settings.dataOutput || false;
      this.editTriggers = settings.editTriggers || false;
      this.colorScale = d3.scale.category20c();
    },
    
    plotdata: function(){
      var data = [];
      _.each(this.collection.models, function(e){
        data.push( e.attributes );
      });
      return data;
    },
    
    plot: function(options) {
      var container = this.container,
          outputs = this.dataOutput,
          editTriggers = this.editTriggers;
            
      var width = 300, //width
          height = 300, //height
          radius = 100, //radius
          color = d3.scale.category20c(); //builtin range of colors

      var data = this.plotdata();
      
      var vis = container
          .append("svg:svg") 
          .data([data]) 
              .attr("width", width) 
              .attr("height", height)
          .append("svg:g") 
              .attr("transform", "translate(" + radius + "," + radius + ")"); 

      var arc = d3.svg.arc() 
          .innerRadius(radius/3)
          .outerRadius(radius);

      var donut = d3.layout.pie() 
          .sort(null)
          .value(function(d) { return d.value; })
          .startAngle(0)
          .endAngle(2*Math.PI);
          
      var arcs = vis.selectAll("g.slice") 
          .data(donut) 
          .enter() 
              .append("svg:g")
                  .attr("class", "slice"); 
                  
          arcs.append("svg:path")
                  .attr("fill", function(d, i) { return color(i); } ) 
                  .attr("d", arc)
                  .each(function(d) { this._current = d; });

      var textCoordinates = [];
                  
          arcs.append("svg:text")                 
                  .attr("transform", function(d) { 
                    d.innerRadius = 0;
                    d.outerRadius = radius;
                    textCoordinates.push(arc.centroid(d));
                    return "translate(" + arc.centroid(d) + ")"; 
                  })
                  .attr("text-anchor", "middle") 
                .text(function(d, i) { return data[i].label; }); 
            
      var textRadius =  MathEquation.polarRadius( textCoordinates[0][0], textCoordinates[0][1] );    
     
      var lastTextAngles = (function( coordinates ){
        var i,
            n = coordinates.length,
            angles = [];
            
        for( i=0; i < n; i += 1 ){                              
          angles.push( (MathEquation.polarAngel( textCoordinates[i][0], textCoordinates[i][1] )*Math.PI)/180 );
        }
        
        return angles;
      })(textCoordinates);
      var initialTextAngles = _.clone(lastTextAngles);

      // util     
      var arcCanRotated = false,
          prevPosition = [0, 0],    // x, y coordinates 
          prevR = 0;                // stores previouse rotation degree
          
        
      /* Output information & user interaction with buttons
       * 
       */     
      if( outputs ){
        outputs.rotationDegree.val( prevR.toFixed(1) );
      }    
      if( editTriggers ){
        editTriggers.slider.bind('click', function(e){
          e.preventDefault();
          //prevR = 0;
          //prevPosition = [0, 0];
          
          var newDegree = parseFloat(outputs.rotationDegree.val());
          prevR = 0;
          updateSliderDependensies(newDegree, {usePrevAngle: false});
          
        });
      };
      
      /*
       *  Update data for slider parts
       */
      var updateSliderDependensies = function(angle){
        var options = arguments[1],
            usePrevAngle = (options && options.usePrevAngle);
        
        var angleForLables = angle,
            angle = prevR + angle;
        
        // Update coordinates for lables
        arcs.selectAll("g.slice text").attr("transform", function(d){
          var x = 0, y = 0, oldAngle;
          
          if( usePrevAngle ){
            oldAngle = lastTextAngles.shift();
          }
          else {
            oldAngle = initialTextAngles.shift();
            initialTextAngles.push( oldAngle );
          } 

          var angleInRadian = (angleForLables*Math.PI)/180;
          
          x = textRadius * Math.cos( oldAngle + angleInRadian );
          y = textRadius * Math.sin( oldAngle + angleInRadian );
          if( usePrevAngle ){
            lastTextAngles.push(  oldAngle + angleInRadian );
          }           
          else {
            lastTextAngles.shift();
            lastTextAngles.push(  oldAngle + angleInRadian );            
          }
          return "translate(" + x + "," + y + ")";
        });      
        
        // Rotate arcs
        arcs.selectAll("g.slice path").attr("transform", "rotate("+ angle + ")");                      
        if( outputs ){
          var angleOutput = (angle < 0 ? angle + 360 : (angle > 360 ? angle - 360 : angle)).toFixed(1);
          outputs.rotationDegree.val(angleOutput);
        }   
        if( !usePrevAngle ){
          prevR = angle;
        }      
      };      
            
      arcs.on("mousedown", function(){
        d3.event.preventDefault();
        prevPosition = d3.svg.mouse(this);
        arcCanRotated = true;
        this.style.cursor = "move";
      })
      .on("mousemove", function(){
        d3.event.preventDefault();
        
        if( arcCanRotated ){
          var position = d3.svg.mouse(this),
              x = position[0],
              y = position[1];
              
          var g = MathEquation.polarAngel( x, y );     
          var g1 = MathEquation.polarAngel( prevPosition[0], prevPosition[1] );          
          updateSliderDependensies( g-g1, {usePrevAngle: true} );
          prevPosition = d3.svg.mouse(this);          
          prevR = prevR + (g-g1);
          puts( prevPosition );
        }
      })
      .on("mouseup", function(){
        d3.event.preventDefault();
        arcCanRotated = false;
        prevPosition = null;
        this.style.cursor = "pointer";             
      });
    }
  })
}
