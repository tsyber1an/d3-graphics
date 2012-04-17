Backbone.d3.Canned['Line'] = {
  View: Backbone.d3.PlotView.extend({
    initialize: function(collection, settings) {
      Backbone.d3.PlotView.prototype.initialize.apply(this, [collection, settings]);
      
      this.width = settings.width || 450;
      this.height = settings.height || 275;
      this.padding = settings.padding || 20;
      this.plotDomain = settings.plotDomain || [0, 8];
      this.sliderLineWidth = settings.sliderLineWidth || 3;
      this.dataOutput = settings.dataOutput || false;
      this.editTriggers = settings.editTriggers || false;

    },
    
    plot: function(options){
      var padding = this.padding,
          sliderLineWidth = this.sliderLineWidth,
          width = this.width,
          outputs = this.dataOutput,
          editTriggers = this.editTriggers;
          
      var data = this.plotdata();
                 
      var x = d3.scale.linear().domain(this.plotDomain).range([0, this.width - 20]),
          y = d3.scale.linear().domain(this.plotDomain).range([this.height, 0]);
      
      var vis = this.container
        .append("svg")
        .data( [data] )
        .attr("width", this.width + this.padding * 2)
        .attr("height", this.height + this.padding * 2)
        .append("g")
        .attr("transform", "translate(" + this.padding + "," + this.padding + ")");
        
      var rules = vis.selectAll("g.rule")
                      .data(x.ticks(10))
                      .enter().append("g")
                      .attr("class", "rule");

        //vertical grid lines
        rules.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", 0)
        .attr("y2", this.height - 1);

        //horizontal grid lines and x axis
        rules.append("line")
          .attr("class", function(d) { return d ? null : "axis"; })
          .attr("y1", y)
          .attr("y2", y)
          .attr("x1", 0)
          .attr("x2", this.width - 19);

        //x axis labels
        rules.append("text")
          .attr("x", x)
          .attr("y", this.height + 3)
          .attr("dy", ".71em")           // [TODO] move to CSS 
          .attr("text-anchor", "middle") // [TODO] move to CSS
          .text(function(d, i){ return i+1; });
        
        //y axis labels
        rules.append("text")
          .attr("y", y)
          .attr("x", -3)
          .attr("dy", ".35em")          // [TODO] move to CSS 
          .attr("text-anchor", "end")   // [TODO] move to CSS 
          .text('11')
          .text(function(d, i){ return i+1; });
        
        //fill
        vis.append("path")
          .attr("class", "area")
          .attr("d", d3.svg.area()
            .x(function(d) { return x(d.x); })
            .y0(function(d) { return y(d.max); })
            .y1(function(d) { return y(d.min); }));
  
        vis.append("path")
          .attr("class", "middle_area")
          .attr("d", d3.svg.area()
            .x(function(d) { return x(d.x); })
            .y0(function(d) { return y(d.mid1); })
            .y1(function(d) { return y(d.mid3); }));
        
      var drawLine = function(y_fn, className, label){
        var className = className || '';
        var line = d3.svg.line()
                .x(function(d) { return x(d.x); })
                .y(y_fn);
        
        var path = vis.append("path")
                .attr("class", "line " + className)
                .attr("d", line);
                
        return path;        
      };
           
      var mainPath = drawLine(function(d) { return y(d.mid2); }, 'main');
      
      var segments = (function(coordinates){
        var _segments = _.compact(coordinates.split(/L|M/)),
            i,
            n = _segments.length,
            clearedSegments = [];
            
        for( i = 0; i < n; i += 1 ){
          var t = _segments[i].split(",");
          
          var x = parseFloat(t[0]),
              y = parseFloat(t[1]);
              
          clearedSegments.push([x, y]);
        }
        
        return clearedSegments;  
        
      })(mainPath.attr('d'));
      
      drawLine(function(d) { return y(d.scr); }, 'dotted black', "scr");
      drawLine(function(d) { return y(d.mcr); }, 'dotted black');
            
      rules.append("text").attr("y", y(data[0].scr)).attr("x", this.width).attr('class', 'label')
        .attr("dy", ".35em")        // vertical-align: middle
        .attr("text-anchor", "end") // text-align: right
        .text("scr");
      
      rules.append("text").attr("y", y(data[0].mcr)).attr("x", this.width).attr('class', 'label')
        .attr("dy", ".35em")        // vertical-align: middle
        .attr("text-anchor", "end") // text-align: right
        .text("mcr");     
      
      var slider = vis.append("g").attr("class", "slider");
      
      // util
      var _dragSliderLine;
      
      // safe layer for slider ability (provide correct & smooth mouse move)
      var rect = slider.append("svg:rect")
        .attr("class", "layer")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", this.width)
        .attr("height", this.height);
      
      var initialPosition = mainPath.node().getPointAtLength(100);
     
      var sliderLine = slider.append("line")        
        .attr("x1", initialPosition.x)
        .attr("x2", initialPosition.x)
        .attr("y1", 0)
        .attr("y2", this.height - 1)
        .attr("stroke-width", sliderLineWidth)        
        .on("mousedown", function(){            
          d3.event.preventDefault();
          _dragSliderLine = this;
        
          this.style.cursor = "move";
          document.body.focus();
          document.onselectstart = function () { return false; };
          
          return false;
        });        
      
      /* [TODO] Make it with modelBinding
       *
       * Print data in out of svg place
       */
      if( outputs ){ 
        outputs.slider.val(initialPosition.x.toFixed(1));
        outputs.circle.x.html(initialPosition.x.toFixed(1));
        outputs.circle.y.html(initialPosition.y.toFixed(1));
      }
      
      if( editTriggers ){
        editTriggers.slider.bind('click', function(e){
          e.preventDefault();
          
          var positionX = parseFloat(outputs.slider.val());
          
          updateSliderDependensies(positionX);
        });
      }
      
      
      var circle = vis.append("circle")
          .attr("class", "intersectcircle")
          .attr("r", 7)
          .attr("transform", "translate("+initialPosition.x+", " + initialPosition.y + ")") 
          .style("fill", "white")
          .style("stroke", "white")
          .style("stroke-opacity", 1);     
      
      var updateSliderDependensies = function(coordinateX){
        // cache            
        var i, n = segments.length, x1, y1, x2, y2;
        
        // find the line segment for corresponding user coordinate +coord+
        // then store that line segment coordinates
        for( i=0; i<n-1; i += 1){
          if( segments[i][0] <= coordinateX && coordinateX <= segments[i+1][0] ){
            x1 = segments[i][0];
            y1 = segments[i][1];                                
            x2 = segments[i+1][0];
            y2 = segments[i+1][1];      
            break;          
          }
        }      
        
        // find y coord using linear equation
        var y = MathEquation.linearYcoordinate(coordinateX, x1, y1, x2, y2);
        
        if(!isNaN(y)){
          // apply new coordinates for slider and circle
          sliderLine.attr("x1", coordinateX).attr("x2", coordinateX);                           
          circle.attr("transform", "translate(" + coordinateX + "," + y + ")")

          // and update output
          if( outputs ){
            outputs.slider.val(coordinateX.toFixed(1));
            outputs.circle.x.html(coordinateX.toFixed(1));
            outputs.circle.y.html(y.toFixed(1));            
          }
        }      
      };
          
      vis.on("mouseup", function(){
          d3.event.preventDefault();
          if (_dragSliderLine != null){
            _dragSliderLine.style.cursor = "pointer";
            _dragSliderLine = null;
          }
        });
        
      rect.on("mousemove", function(){   
          d3.event.preventDefault();     
          
          if( _dragSliderLine != null ){  
            
            // store relative x coordinate     
            var coord = d3.mouse(this)[0];
     
            // apply changes
            updateSliderDependensies(coord);
          }
        });
      
    },
    plotdata: function(){
      var transformedData = [],  
          data = this.collection.models[0].get("forecastSolvencyMargine"),
          n = data.points[0].length,
          i; 
      
      for( i = 0; i < n; i += 1 ){
        transformedData.push({
          max: data.points[0][i],
          mid1: data.points[1][i],
          mid2: data.points[2][i],
          mid3: data.points[3][i],
          min: data.points[4][i],
          mcr: data.mcr,
          scr: data.scr,
          x: i
        });
      }    
      
      return transformedData;           
    }
  })
}
