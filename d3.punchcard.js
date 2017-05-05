/*
*	Define chart 
*/
function punchcard(){
	// Default settings
	var $el = d3.select("body");
	var maxRadius = 9;
	var minRadius = 2;
	var margin = {top: 40, right: 200, bottom: 40, left: 20};
	var width = 300;
	var height = 200;
	var color = "steelblue";
	var data = [];
	var object = {};
	var formatTick = d3.format("0000");
	var svg, x, xAxis, allValues, xScale, colorScale;
	var rowHeight = (maxRadius*2)+2;
	var useGlobalScale = true;
	var selectedChord;
	var selectedCircles;

	object.render = function(){
		x = d3.scale.linear()
			.range([0, width]);

		xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		xAxis.ticks(_.uniq(_.flatten(_.map(_.pluck(data, 'values'), function(v) { return _.pluck(v, 'key') }))).length)
				.tickFormat(formatTick);

		svg = $el.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.bottom)
			.style("margin-left", margin.left + "px")
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		var domain = d3.extent(allValues, function(d){return d['key'];});
		var valDomain = d3.extent(allValues, function(d){return d['value'];});

		x.domain(domain);

		xScale = d3.scale.linear()
			.domain(domain)
			.range([0, width]);

		colorScale = d3.scale.linear()
      .domain(d3.extent(allValues, function(d){return d['value'];}))
      .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

		svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (height - margin.bottom) + ")")
		.call(xAxis);

		function mouseover(p) {
			var g = d3.select(this).node().parentNode;
			d3.select(g).selectAll("circle").style("fill","rgb(156, 62, 62)");
		}

		function mouseout(p) {
			var g = d3.select(this).node().parentNode;
			var chrodElem = $(d3.select(this).node().parentNode).find('.label');
			var _selectedChord = chrodElem[0].textContent;

			if (_.isUndefined(selectedChord) || selectedChord != _selectedChord) {
				d3.select(g).selectAll("circle").style("fill","black");
			}	
		}

		for (var j = 0; j < data.length; j++) {
			var g = svg.append("g");

			var circles = g.selectAll("circle")
				.data(data[j]['values'])
				.enter()
				.append("circle");

			var rDomain = useGlobalScale ? valDomain : [0, _.max(_.pluck(_.flatten(_.pluck(data, 'values')), 'value'))];
			var rScale = d3.scale.linear()
				.domain(rDomain)
				.range([minRadius, maxRadius]);

			circles
				.attr("cx", function(d, i) { return xScale(d['key']); })
				.attr("cy", (height - margin.bottom - rowHeight*2) - (j*rowHeight)+rowHeight)
				.attr("r", function(d) { return rScale(d['value']); })
				.style("fill", function(d) { return colorScale(d['value']) })
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);

			g.append("text")
				.attr("y", (height - margin.bottom - rowHeight*2) - (j*rowHeight)+(rowHeight+5))
				.attr("x",width+rowHeight)
				.attr("class","label")
				.text(data[j]['key'])
				.style("fill", function(d) { return color })
				.on("mouseover", mouseover)
				.on("mouseout", mouseout);

			g.on("click", function() {
				var chrodElem = $(d3.select(this).node()).find('.label');
				
				selectedChord = chrodElem[0].textContent;

				if (!_.isUndefined(selectedCircles)) {
					selectedCircles.css("fill","black");
				}
				
				selectedCircles = $(d3.select(this).node()).find('circle');

				chrodElem.trigger('chord-clicked', selectedChord);
			});

		};

		return object;
	};

	// Getter and setter methods
  object.data = function(value){
    if (!arguments.length) return data;
    data = value;
    allValues = [];
		data.forEach(function(d){
			allValues = allValues.concat(d.values);
		});
    return object;
  };

  object.minRadius = function(value){
  	if (!arguments.length) return minRadius;
  	minRadius = value;
  	return object;
  };

  object.maxRadius = function(value){
  	if (!arguments.length) return maxRadius;
  	maxRadius = value;
  	rowHeight = (maxRadius*2)+2;
  	return object;
  };

  object.$el = function(value){
    if (!arguments.length) return $el;
    $el = value;
    return object;
  };

  object.width = function(value){
    if (!arguments.length) return width;
    width = value;
    return object;
  };

  object.height = function(value){
    if (!arguments.length) return height;
    height = value;
    return object;
  };

  object.color = function(value){
    if (!arguments.length) return color;
    color = value;
    return object;
  };

 	object.useGlobalScale = function(value){
    if (!arguments.length) return useGlobalScale;
    useGlobalScale = value;
    return object;
  };
  return object;
};