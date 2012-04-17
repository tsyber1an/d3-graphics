Backbone.d3.Canned['BarWithLine'] = {
  Collection: Backbone.d3.PlotCollection.extend({
    initialize: function(models, settings) {
      Backbone.d3.PlotCollection.prototype.initialize.apply(this, [models, settings]);
    },
    
    parse: function(response){
      return response.data;
    }
  }),
  
  View: Backbone.d3.PlotView.extend(
  {
  
    initialize: function(collection, settings) {
      Backbone.d3.PlotView.prototype.initialize.apply(this, [collection, settings]);

  	  this.width = settings.width || 20;
      this.height = settings.height || 80;
      this.barWidth = settings.barWidth || 15;
      this.barHeight = settings.barHeight || 100;
      this.barDomain = settings.barDomain || { x: 0.5, y: 100 },      
      this.lineDomain = settings.lineDomain || { x : 7, y : 7 }
      this.scrolling = settings.scrolling || false;
      this.size = settings.size || 5;
      this.userPercent = settings.userPercent || { left : 15, right : 5 };
      
      // Positions of top elements: triangels and etc (fixed)
      this.labelsPaddingTop = 24;
      this.triangelLength = 15;
      
      this.callBackId = settings.callBackId || false;
      this.cdfCallBackOutput = settings.cdfCallBackOutput || { 
        sum : { left: null, right:null, middle:null},
        pc : { left: null, right:null, middle:null},
        sigma : null 
      }
    },
    
    plotdata: function(){
      var data = [];
      this.collection.forEach(function(datapoint) {
          data.push({x:datapoint.get('x'), y:datapoint.get('y')});
        }
      )
      // Needed for scolling plots
      if (data.length > this.size){
        return _.last(data, this.size);
      } else {
        return data;
      }
    },
        
    plot: function( ) {
      var container = this.container,
          width = this.width,
          height = this.height,
          barHeight = this.barHeight,
          barWidth = this.barWidth,
          data = this.plotdata(),
          userPercent = this.userPercent,
          $cdfSum = this.cdfCallBackOutput.sum,
          $cdfPc = this.cdfCallBackOutput.pc,
          callBackId = this.callBackId,
          $sigma = this.cdfCallBackOutput.sigma;
          
      var scale = barHeight / _.max(data, function(d) { return d.y; }).y,
          yval = function(d) { return height - scale * d.y; };
      
      var x = d3.scale.linear().domain([0, this.lineDomain.x]).range([0, width]),
          y = d3.scale.linear().domain([0, this.lineDomain.y]).range([height, 0]),
          barx = d3.scale.linear().domain([0, this.barDomain.x]).range([0, barWidth]),
          bary = d3.scale.linear().domain([0, this.barDomain.y]).rangeRound([0, barHeight]);
    
      // An SVG element.
      var svg = this._createSVG();
      
      // A container to hold the y-axis rules.
      var yAxis = this._drawYAxis( svg, y, 10 );
      var xAxis = this._drawXAxis( svg, x, data.length - 1 ); 
        
      // A Bar elements with labels
      var rects_positions = this._drawBarsWithLabels( svg, data, scale, { x : barx, y: yval } );

      var cdfData = this._CDFCalculation( data, rects_positions );
      var sigma = cdfData.sigma,
          sigmaSegmentsData = cdfData.segments, 
          sigmaSegmentsDataReverse = cdfData.segmentsReverse,
          sigmaSegmentsSize = sigmaSegmentsData.length;  
            
      // Output sigma into template          
      $sigma.html(sigma);        

      var rectOptions = this._sliderCoverPositions( barx );
      
      var slider = svg.append("g").attr("class", "slider");
      
      var sliders_config = (function(){
        return {
          left : function(_pc){
            return rectOptions.calc({sigma: sigma, data: sigmaSegmentsData, pc: _pc});
          },
          right : function(_pc){
            return rectOptions.calc({sigma: sigma, data: sigmaSegmentsDataReverse, pc: _pc});
          }
        }
      }());
      
      // Temp and cache vars
      var slidersConfigLeft = sliders_config.left(userPercent.left),
          slidersConfigRight = sliders_config.right(userPercent.right),
          sliderLeftPosition = slidersConfigLeft.pos,
          sliderLeftPercent = slidersConfigLeft.pc,
          sliderRightPosition = slidersConfigRight.pos,
          sliderRightPercent = slidersConfigRight.pc,
          sliderLeftSum = slidersConfigLeft.sum,
          sliderRightSum = slidersConfigRight.sum,
          sliderRightXAxis = slidersConfigRight.x,
          sliderLeftXAxis = slidersConfigLeft.x;          
      
      // Update callBackOutput    
      $cdfSum.left.val( sliderLeftSum );    
      $cdfSum.middle.val( (sigma - sliderLeftSum - sliderRightSum).toFixed(1) );
      $cdfSum.right.val( sliderRightSum );
      $cdfSum.left.attr('default-value', sliderLeftSum);    
      $cdfSum.middle.attr('default-value', (sigma - sliderLeftSum - sliderRightSum).toFixed(1) );
      $cdfSum.right.attr('default-value', sliderRightSum);      
      
      $cdfPc.left.val(sliderLeftPercent);    
      $cdfPc.middle.val( (100 - sliderLeftPercent - sliderRightPercent).toFixed(1) );
      $cdfPc.right.val(sliderRightPercent);   
        
      $cdfPc.left.attr('default-value', sliderLeftPercent);    
      $cdfPc.middle.attr('default-value', (100 - sliderLeftPercent - sliderRightPercent).toFixed(1) );
      $cdfPc.right.attr('default-value', sliderRightPercent);       
      
      if( callBackId ){
        callBackId.pc.bind("click", function(){
          var leftPc = $cdfPc.left.val();
          
          if( parseFloat(leftPc) != parseFloat($cdfPc.left.attr('default-value')) ){
            slidersConfigLeft = sliders_config.left(leftPc);
            sliderLeftPosition = slidersConfigLeft.pos;
            sliderLeftPercent = slidersConfigLeft.pc;        
            updateSliderLeftSide();
          }
          
          var rightPc = $cdfPc.right.val();
          
          if( parseFloat(rightPc) != parseFloat($cdfPc.right.attr('default-value')) ){                  
            slidersConfigRight = sliders_config.right(rightPc);
            sliderRightPosition = slidersConfigRight.pos;
            sliderRightPercent = slidersConfigRight.pc;      
            updateSliderRightSide();        
          }
            
          return false;
        });
        
        callBackId.sum.bind("click", function(){
          var sumLeft = $cdfSum.left.val(),
              leftPc = ((sumLeft * 100)/sigma).toFixed(1);
              
          slidersConfigLeft = sliders_config.left(leftPc);
          sliderLeftPosition = slidersConfigLeft.pos;
          sliderLeftPercent = slidersConfigLeft.pc;        
          updateSliderLeftSide();
          
          var sumRight = $cdfSum.right.val(),
              rightPc = ((sumRight * 100)/sigma).toFixed(1);
              
          slidersConfigRight = sliders_config.right(rightPc);
          sliderRightPosition = slidersConfigRight.pos;
          sliderRightPercent = slidersConfigRight.pc;      
          updateSliderRightSide();  
                  
          return false;
        });        
      }            
          
      var sliderParts = this._createSliderParts({
              d3Obj : slider,
              leftPart : { position : sliderLeftPosition }, 
              rightPart : { position : sliderRightPosition } 
            }),
          leftRect = sliderParts.leftArea,
          rightRect = sliderParts.rightArea;
          
      // A container to hold slider labels and markeres (triangles)
      var sliderLabels = svg.append("g").attr("class", "slider_labels");     
      
      this._sliderLabelsSetup({
        d3Obj : sliderLabels,
        left : { position : sliderLeftPosition, percent : sliderLeftPercent },
        right : { position : sliderRightPosition, percent : sliderRightPercent }
      });   
      
      var histogramValues = svg.append("g").attr("class", "histogram_labels");
      
      histogramValues.append("text")
        .attr("font-size", ".7em")
        .attr("x", sliderLeftPosition - 7) 
        .attr("y", this.labelsPaddingTop - 7)
        .attr("class", 'left')
        .text(sliderLeftXAxis);
        
      histogramValues.append("text")
        .attr("font-size", ".7em")
        .attr("x", sliderRightPosition - 7) 
        .attr("y", this.labelsPaddingTop - 7)
        .attr("class", 'right')
        .text(sliderRightXAxis);       
      
      var sumLabels = svg.append("g").attr("class", "sum_labels");   
      
      sumLabels.append("text")
        .attr("font-size", ".9em")
        .attr("x", sliderRightPosition + (width - sliderRightPosition)/2) 
        .attr("y", this.labelsPaddingTop + this.height/2)
        .attr("class", 'right')
        .text(sliderRightSum);      
        
      sumLabels.append("text")
        .attr("font-size", ".9em")
        .attr("x", sliderLeftPosition/2) 
        .attr("y", this.labelsPaddingTop + this.height/2)
        .attr("class", 'left')
        .text(sliderLeftSum);         
      
      
      // A container for slider's traingales (that placed on top of sliders)
      var sliderTriangales = svg.append("g").attr("class", "slider_triangles");
      
      // A variable for slider's triangles length
      var delta = this.triangelLength;  
      
      // A coordinates of triangles dependes of +relative_position+
      var trp = (this.labelsPaddingTop - delta/(2 * Math.sqrt(2)));
      
      var triangle_points = function(relative_position){
        return [
          [relative_position - delta/2, trp].join(','),
          [relative_position, delta + trp/Math.sqrt(2)].join(','),
          [relative_position + delta/2, trp].join(',')
        ].join(' ');
      };
      
      // Interpolation for calculation percent of cdf sum
      var calcPercent = function( args ){
        var a = args.rawLeft, 
            b = args.rawRight, 
            pa = args.pcLeft, 
            pb = args.pcRight
            x = args.userValue;
        
        return (((x - a)/(b - a)) * (pb - pa) + pa).toFixed(1);
      }
      
      // A utils vars for callbacks
      var _dragRightTriangle,
          _dragLeftTriangle;
          
      // A triagel for left slider
      sliderTriangales.append("polygon")
          .attr("class", "left")
          .attr("points", triangle_points(sliderLeftPosition))
          .on("mousedown", function(){
              
            this.style.cursor = "move";
            _dragLeftTriangle = this;
            document.body.focus();
            document.onselectstart = function () { return false; };
            
            return false;
          });
      
      // A triagel for right slider
      sliderTriangales.append("polygon")
          .attr("class", "right")
          .attr("points", triangle_points(sliderRightPosition))
          .on("mousedown", function(){
            d3.event.preventDefault();          
              
            this.style.cursor = "move";
            _dragRightTriangle = this;
            document.body.focus();
            document.onselectstart = function () { return false; };
            
            return false;
          });

      // Handle user's mouse moves of the sliders
      svg.on("mouseup", function(){
          if (_dragRightTriangle != null){
            _dragRightTriangle.style.cursor = "pointer";
            _dragRightTriangle = null;
          }
          if (_dragLeftTriangle != null){
            _dragLeftTriangle.style.cursor = "pointer";
            _dragLeftTriangle = null;
          }          
        })
        .on("mousemove", function(){
          d3.event.preventDefault();
          
          if( _dragRightTriangle != null )
          {
          
            var clientX = d3.svg.mouse(this)[0];                         
          
            var p;
          
            for( i=0; i < sigmaSegmentsSize; i += 1 )
            {
              var leftPos = parseInt(sigmaSegmentsDataReverse[i][3][0]),
                  rightPos = parseInt(sigmaSegmentsDataReverse[i][3][1]);            
                  
              // Lets find out initial pos and pc
              if( leftPos <= clientX && clientX <= rightPos )
              {
                switch( clientX ){
                  case leftPos: 
                    sliderRightPercent = sigmaSegmentsDataReverse[i-1][1];
                    break;
                  case rightPos:
                    sliderRightPercent = sigmaSegmentsDataReverse[i][1];
                    break;
                  default:
                    var pa = sigmaSegmentsDataReverse[i+1][1],
                        a = sigmaSegmentsDataReverse[i+1][4],
                        pb = sigmaSegmentsDataReverse[i][1],
                        b = sigmaSegmentsDataReverse[i][4];
                    
                    // Create fraction with 10 items     
                    var userSeg = [ leftPos, rightPos ],
                        barSeg = [a, b];
                        
                    sliderRightXAxis = mapper( userSeg, barSeg, clientX );
                    sliderRightPercent = calcPercent({rawLeft: a, rawRight: b, pcLeft: pa, pcRight: pb, userValue: sliderRightXAxis });
                }     
                sliderRightSum = ((sigma * sliderRightPercent)/100).toFixed(1);
                break;
              }
            }
            
            // Now apply new positions for slider parts
            sliderRightPosition = clientX;            
            updateSliderRightSide();
          }
            
          if( _dragLeftTriangle != null )
          {          
            var clientX = d3.svg.mouse(this)[0];              
            
            for( i=0; i < sigmaSegmentsSize; i += 1 )
            {
              var leftPos = parseInt(sigmaSegmentsData[i][3][0]),
                  rightPos = parseInt(sigmaSegmentsData[i][3][1]);            
                  
              // Lets find out initial pos and pc
              if( leftPos <= clientX && clientX <= rightPos )
              {  
                switch( clientX ){
                  case leftPos: 
                    sliderLeftPercent = sigmaSegmentsData[i-1][1];
                    break;
                  case rightPos:
                    sliderLeftPercent = sigmaSegmentsData[i][1];
                    break;
                  default:
                    var pa = sigmaSegmentsData[i-1][1],
                        a = sigmaSegmentsData[i-1][4],
                        pb = sigmaSegmentsData[i][1],
                        b = sigmaSegmentsData[i][4];
                    
                    // Create fraction with 10 items     
                    var userSeg = [ leftPos, rightPos ],
                        barSeg = [a, b];
                        
                    sliderLeftXAxis = mapper( userSeg, barSeg, clientX );    
                        
                    sliderLeftPercent = calcPercent({rawLeft: a, rawRight: b, pcLeft: pa, pcRight: pb, userValue: sliderLeftXAxis });
                }    
                
                sliderLeftSum = ((sigma * sliderLeftPercent)/100).toFixed(1);
                
                break;
              }
            }
                        
            // Now apply new positions for slider parts
            sliderLeftPosition = clientX;
            updateSliderLeftSide();
          }
       });
       
       var updateSliderLeftSide = function(){
          // A parts of slider polygon. Apply changes for them.
          sliderTriangales.selectAll("polygon.left")
              .attr("points", triangle_points(sliderLeftPosition));
              
          leftRect.attr("width", sliderLeftPosition);
          
          // change slider's text positions and inner text
          sliderLabels.selectAll("text.left")
              .attr("x", sliderLeftPosition/2)
              .text([sliderLeftPercent, '%'].join(''));
              
          sliderLabels.selectAll("text.center")
              .attr("x", (sliderLeftPosition + sliderRightPosition)/2)
              .text( [(100 - sliderRightPercent - sliderLeftPercent).toFixed(1), '%'].join('') );
              
          histogramValues.selectAll("text.left")
            .attr("x", sliderLeftPosition - 7) 
            .text(sliderLeftXAxis);            
            
          sumLabels.selectAll("text.left")
            .attr("x", sliderLeftPosition/2) 
            .text(sliderLeftSum);               
              
          $cdfSum.middle.val( (sigma - sliderLeftSum - sliderRightSum).toFixed(1) );
          $cdfSum.left.val( sliderLeftSum );        
                    
          $cdfPc.left.val( sliderLeftPercent );    
          $cdfPc.middle.val( (100 - sliderLeftPercent - sliderRightPercent).toFixed(1) );      
       };
       
       var updateSliderRightSide = function(){
          // A parts of slider polygon. Apply changes for them.
          sliderTriangales.selectAll("polygon.right")
              .attr("points", triangle_points(sliderRightPosition));
              
          rightRect.attr("width", width - sliderRightPosition);
          rightRect.attr("x", sliderRightPosition );
          
          // change slider's text positions and inner text
          sliderLabels.selectAll("text.right")
              .attr("x", sliderRightPosition + (width - sliderRightPosition)/2)
              .text([sliderRightPercent, '%'].join(''));
              
          sliderLabels.selectAll("text.center")
              .attr( "x", (sliderLeftPosition + sliderRightPosition)/2 )
              .text( [(100 - sliderRightPercent - sliderLeftPercent).toFixed(1), '%'].join('') );
              
          histogramValues.selectAll("text.right")
            .attr("x", sliderRightPosition - 7) 
            .text(sliderRightXAxis);             
            
          sumLabels.selectAll("text.right")
            .attr("x", sliderRightPosition + (width - sliderRightPosition)/2) 
            .text(sliderRightSum);                 
              
          $cdfSum.middle.val( (sigma - sliderLeftSum - sliderRightSum).toFixed(1) );
          $cdfSum.right.val( sliderRightSum );
          
          $cdfPc.middle.val( (100 - sliderLeftPercent - sliderRightPercent).toFixed(1) );
          $cdfPc.right.val( sliderRightPercent );  
       }       

    },
    
    /*
     * Private Function
     *
     */       
    _createSVG : function(){
      var svg = this.container.append("svg")
            .attr("class", "chart")
            .attr("width", this.width)
            .attr("height", this.height);
            
      return svg;                        
    },
    
    /*
     * Private Function
     *
     */    
    _drawYAxis : function( svgObject, yAxisLinear, axisCount ){
      var rules = svgObject.selectAll("g.yaxis")
        .data(yAxisLinear.ticks(axisCount))
        .enter().append("g")
        .attr("class", "yaxis")
        .attr("transform", "translate(0, "+this.labelsPaddingTop+")");
        
      rules.append("line")
        .attr("x1", 0)
        .attr("x2", this.width - 1)
        .attr("y1", yAxisLinear)
        .attr("y2", yAxisLinear);    
      return rules;  
    },
    
    /*
     * Private Function
     *
     */    
    _drawXAxis : function( svgObject, linear, axisCount ){
      var rules = svgObject.selectAll("g.xaxis")
        .data(linear.ticks(axisCount))
        .enter().append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0, "+this.labelsPaddingTop+")");
        
      rules.append("line")
        .attr("x1", linear)
        .attr("x2", linear)
        .attr("y1", 0)
        .attr("y2", this.height);    
        
      rules.append("text")  
          .attr("font-size", ".7em")
          .attr("class", "xaxis_labels")
          .attr("x", linear)
          .attr("y", 10) 
          .text(function(d, i){ return i+1; })         
      return rules;  
    },    
    
    /*
     * Private Function
     *
     */    
    _drawBarsWithLabels : function( svg, data, scale, position ){
      var rects_positions = [],
          plotW = this.barWidth * data.length - 1,
          barW = this.barWidth,
          barDomainX = this.barDomain.x;
      
      svg.append("g").attr("class", "bar")
        .attr("width", plotW)
        .attr("height", this.barHeight).append("g")
        .selectAll("rect")
            .data(data)
            .enter().append("svg:rect")
              .attr("x", function(d, i) { 
                var p = position.x(i);
                rects_positions.push(p+barW);
                return p; 
              })
              .attr("y", function(d) { return position.y(d) })
              .attr("width", barW)
              .attr("height", function(d) { return scale * d.y; })
              
      var bar_labels = svg.append("g").attr("class", "bar_labels")
        .selectAll("text")
          .data(data).enter()
        .append("text")
          .attr("x", function(d, i) { return position.x(i); })
          .attr("y", function(d) { return position.y(d) })
          .text(function(d) { return d.y; });    
                
      return rects_positions;    
    },
    
    /*
     * Private Function
     *
     */
    _CDFCalculation : function( _data, positions ){
      var sigma = 0,
          sigmaSegmentsData = [], // each instance will be an array: 0 - sum, 1 - percentage, 2 - x coord
          sigmaSegmentsDataReverse = [],
          sigmaPartsSegments = [];
    
      _.each( _data, function(elem){ sigma += elem.y; } );
     
      /* [TODO] 
       * - change structure of sigmaSegmentsData
       *
       */
      (function(){
        var j,
            n = _data.length;
            
        sigmaSegmentsData.push([ 0, 0, 0, [0,0]]);   
         
        for( j = 0; j < n; j += 1 ){
          var segmentsum = 0;
          
          if( j == 0 ){
            segmentsum += _data[j].y;
          }
          else {
            var i = 0;
            while( !_.isEqual(_data[i], _data[j+1]) )
            {
              segmentsum += _data[i].y;
              i += 1;
            }
          }
          var formattedPercent = ((segmentsum * 100)/sigma).toFixed(1);
          sigmaSegmentsData.push([ segmentsum, formattedPercent, _data[j].x, [positions[j-1] || 0, positions[j]], _data[j].y ]);
        }
      })();      
      
      (function(){
        var j,
            n = _data.length - 1;
    
        sigmaSegmentsDataReverse.push([ 0, 0, 0, [0,0] ]);    
    
        for( j = n; j > 0; j -= 1 ){
          var segmentsum = 0
          
          if( j == n ){
            segmentsum += _data[j].y;
          }
          else {          
            var i = n;
            while( !_.isEqual(_data[i], _data[j-1]) )
            {
              segmentsum += _data[i].y;
              i -= 1;
            }
          }
          var formattedPercent = ((segmentsum * 100)/sigma).toFixed(1);
          sigmaSegmentsDataReverse.push([ segmentsum, formattedPercent, _data[j].x, [positions[j-1] || 0, positions[j]], _data[j].y ]);
        }
        sigmaSegmentsDataReverse.push([ sigma, 100, 0, [0,0] ]);
      })();
      
      return {
        sigma : sigma,
        segments : sigmaSegmentsData,
        segmentsReverse : sigmaSegmentsDataReverse
      }             
    },
    
    /*
     * Private Function
     * 
     * For given default user +percentage+ and +data+
     * calculate position and percentage of cover for rectangel on SVG plot
     *
     * Usage:
     * rectOptions.calculate({sigma: sigma, data: data, userPercent: userPercent})
     * rectOptions.calculate({sigma: sigma, data: data, userPercent: userPercent, reverse: true})
     *
     */    
    _sliderCoverPositions : function( barPosition ){
      var _calc = {
        rect : 0,
        pc : 0,
        sum : 0,
        x: 0,
        init : function( global_sigma, iter_data, pc){
          var user_sigma = (global_sigma * pc)/100,
              i = 0;

          this.pc = 0;
          this.rect = 0;
          this.sum = 0;
          this.x = 0;
          
          while( iter_data[i][0] < user_sigma )
          {
              i += 1;
          }
          
          this.sum = iter_data[i][0];
          this.pc = iter_data[i][1];
          this.rect = iter_data[i][2];
          this.x = iter_data[i][4]
        }
      };
      
      return {
        calc : function( args ){
          _calc.init( args.sigma, args.data, args.pc);
          
          var p = (barPosition(_calc.rect));
          
          return {
            pos : (args.reverse ? p : (p - 5)),
            pc : _calc.pc,
            sum : _calc.sum,
            x : _calc.x
          }
        }
      }
    },    
    
    /*
     * Private Function
     *
     */      
    _createSliderParts : function( args ){
      var slider = args.d3Obj,
          leftPart = args.leftPart,
          rightPart = args.rightPart;
    
      var leftRect = slider.append("svg:rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("transform", "translate(0, "+this.labelsPaddingTop+")")
        .attr("width", leftPart.position)
        .attr("height", this.height);
        
      var rightRect = slider.append("svg:rect")
        .attr("x", rightPart.position)
        .attr("y", 0)
        .attr("transform", "translate(0, "+this.labelsPaddingTop+")")
        .attr("width", this.width - rightPart.position)
        .attr("height", this.height);
   
      var wrapper = slider.append("svg:rect")
        .attr("class", "slider_wrapper")
        .attr("transform", "translate(0, "+this.labelsPaddingTop+")")
        .attr("width", this.width)
        .attr("height", this.height);
        
      return {
        leftArea : leftRect,
        rightArea : rightRect
      }      
    },    
    
    /*
     * Private Function
     *
     */       
    _sliderLabelsSetup : function( args ){
      var sliderText = args.d3Obj,
          leftPosition = args.left.position,
          rightPosition = args.right.position,
          leftPercent = args.left.percent,
          rightPercent = args.right.percent,
          paddingTop = this.labelsPaddingTop;
    
      var slidersLabelsSetups = {
        _config : {
          "y" : paddingTop - 3,                             /* y -- vertical margin */
          "font-size" : ".7em"
        },
        labels : {
          left : {
            "x" : leftPosition/2,
            "class" : "left",
            text : [leftPercent, '%'].join('')
          },
          center : {
            "x" : (leftPosition + rightPosition)/2,
            "class" : "center",
            text : [(100 - leftPercent - rightPercent).toFixed(1), '%'].join('')
          },
          right : {
            "x" : rightPosition + (this.width - rightPosition)/2,
            "class" : "right",
            text : [rightPercent, '%'].join('')
          }
        }
      };
      
      /* Setup slider's texts
       * Add labels to show percentage for +each+ slider area
       *
       * Slider areas are left, center and right.
       */
      _.each(slidersLabelsSetups.labels, function(opts, label){
        var _text = sliderText.append("text"), // An svg text element
            _opts = _.clone(opts); // copy of opts
            
        _.each(_.extend(_opts, slidersLabelsSetups._config), function(value, opt){
          opt == "text" ? _text.text(value) : _text.attr(opt, value);
        });
        
      });    
    }    
  })
}
