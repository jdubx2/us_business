
var margin = {top: 60, right: 107, bottom: 50, left: 80},
	width = $(window).width() * .64 - margin.left - margin.right,
	height = 380 - margin.top - margin.bottom;
	
var x = d3.scaleLinear()
	.range([0, width]);

var y = d3.scaleLinear()
	.range([height, 0]);
	
//var color = d3.scaleOrdinal(d3.schemeCategory10);
var color = d3.scaleOrdinal()
	.range(["#FD6467","#5B1A18","#D67236","#3B9AB2","#78B7C5","#EBCC2A","#E1AF00","#F21A00"
                   ,"#446455","#FDD262","#35274A","#F2300F","#F3DF6C","#CEAB07","#D5D5D3","#24281A"
                   ,'#F44336','#673AB7','#607D8B','#4CAF50','#FF9800','#9C27B0','#CDDC39','#3F51B5'
                   ,'#3A225E','#B17090','#804DB4','#A25503','#FCE300']);

	
var yr_svg = d3.select("#lines")
	.append("svg")
		.attr("id", "yr_lines")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
			.attr("class", "yr_lines_g");
		

Shiny.addCustomMessageHandler("initData",
		function(data){ 
		
		//console.log(data);
		
		var fys = [];
		data.forEach(function(d,i) {fys.push(d['FISCAL_YEAR']);});
		var xRange = d3.extent(fys);
		
		var amounts = [];
		data.forEach(function(d,i) {amounts.push(d['revenue']);});
		var yRange = d3.extent(amounts);

		x.domain([xRange[0], xRange[1]]).nice();
		y.domain([0, yRange[1]]).nice();
		
		var amtLine = d3.line()	
		.x(function(d) { return x(d['FISCAL_YEAR']); })
		.y(function(d) { return y(d['revenue']); });
		
		var dataNest = d3.nest()
		.key(function(d) {return d['SEASON_NUM']; })
		.entries(data);
		
		yr_svg.append("g")
			.attr("class", "x_axis")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x)
				.tickFormat(d3.format("d")))
				//.tickValues(d3.range(xRange[0]-1, xRange[1] + 1, 1)))
		   .append("text")
			.attr("class", "label")
			.attr("x", width)
			.attr("y", -6)
			.style("text-anchor", "end")
			.text("Season");
			
		yr_svg.append("g")
			.attr("class", "y_axis")
			.call(d3.axisLeft(y)
				.tickFormat(d3.format(".2s")))
		   .append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Amount")
			
		yr_svg.append("g")
		  .attr("id", "x_grid")
		  .attr("class", "grid")
		  .attr("transform", "translate(0," + height + ")")
		  .call(d3.axisBottom(x)
			  .tickSize(-height)
			  .ticks(5)
			  .tickFormat(""));

		yr_svg.append("g")	
		  .attr("id", "y_grid")
		  .attr("class", "grid")
		  .call(d3.axisLeft(y)
			  .tickSize(-width)
			  .tickFormat(""));
			  
		var remove_ht = function(d){ return d.replace('#','P')}
		
		 dataNest.forEach(function(d,i) { 

			var path = yr_svg.append("path")
				.attr("id", function() {return remove_ht(color2(d.key));})
				.attr("class", "line")
				.style("stroke", function() { // Add the colours dynamically
					return d.color = color(d.key); })
				.style("fill", "none")
				.style("stroke-width", 3)
				.attr("d", amtLine(d.values));
				
			 var totalLength = path.node().getTotalLength();

			path.attr("stroke-dasharray", totalLength + " " + totalLength)
				.attr("stroke-dashoffset", totalLength)
				.transition()
					.duration(1500)
					.ease(d3.easeSin)
					.attr("stroke-dashoffset", 0);
		});
		
		var seasons = [];
			data.forEach(function(d,i) {seasons.push(d['SEASON_NUM']);});
			
		var f = d3.format(".2s");
		
		var tool_tip = d3.tip()
		  .attr("class", "d3-tip")
		  .offset([-8, 0])
		  .html(function(d,i) { return f(d); });
		yr_svg.call(tool_tip);
		
		var highlight = function(d,i) { 
			
   		reg_svg.selectAll('#'+d)
			.transition()
			.duration(20)
			.style("stroke-width",5); 
		} 
		
		var unhighlight = function(d,i) { 
			
   		reg_svg.selectAll('#'+d)
			.transition()
			.duration(20)
			.style("stroke-width",3); 
		} 
		
		yr_svg.selectAll("dot")
			.data(amounts)
			.enter().append("circle")
				.attr("class", "dot")
				.attr("cx", function(d,i) {return x(fys[i]); })
				.attr("cy", function(d) {return y(d); })
				.attr("r", 5.6)
				.style("fill", function(d,i) {return color(seasons[i]); })
				.attr('fill-opacity', 0.6)
				.style("stroke", "white")
				.style("stroke-width", ".03em")
					.on('mouseover', function(d) {tool_tip.show(d);
											  d3.select(this)
												.style("stroke-width", ".1em")
												.style("stroke", "black")
												.attr("fill-opacity", 1);})
					.on('mouseout', function(d) {tool_tip.hide(d);
											  d3.select(this)
												.style("stroke-width", ".03em")
												.style("stroke", "white")
												.attr("fill-opacity", .6);});
												
		yr_svg.append("g")
		  .attr("class", "legendColor")
		  .attr("transform", "translate(" + (width + 10) + "," + (height - (height - margin.top)) + ")");
		
		var legend = d3.legendColor()
			.scale(color)
			.shape("line")
			.shapeWidth(15)
			.labelOffset(3);
			
		yr_svg.select(".legendColor")
			.call(legend);
			
		yr_svg.selectAll(".swatch")
			.attr('stroke-width', 3.5);
			
		var lbl  = function(lab){
			return  'Season ' + lab;
		}
		
		 yr_svg.selectAll('.label')
			.text(function(d){return lbl(d);});
		
		

});


	Shiny.addCustomMessageHandler("showData",
		function(data){ 
	
	if(data.missing == 'No Season Data Found'){
		
		console.log('no data');
		
		x.domain([0,0]);
		y.domain([0,0]);
		
		var yr_svg = d3.select(".yr_lines_g");
		
		yr_svg.select(".x_axis")
					.transition()
					.duration(1000)
						.call(d3.axisBottom(x));
		
		$(".x_axis").empty();
						

		yr_svg.select(".y_axis")
					.transition()
					.duration(1000)
						.call(d3.axisLeft(y))
						.empty();
						
		$(".y_axis").empty();
							
		yr_svg.selectAll(".line")
			.transition()
			.duration(1500)
				.style("stroke-width", 0)
				.remove();
		
		yr_svg.selectAll(".dot")
			.transition()
			.duration(1500)
				.attr("r", 0)
				.remove();
				
		$(".legendColor").empty();
		
		yr_svg.append('g')
			.attr("class", "noData")
			.attr("transform", "translate(" + (width / 2.8) + "," + (height / 2) + ")")
			.append("text")
				.text('No Season Data Found')
				.style('font-size', 22)
				.style('fill', 'white')
				.transition()
				.duration(1000)
				.style('fill','black');
			
		
		
		
	} else {
		
		$(".noData").remove();
		$(".svgTitle").remove();
		
		
		d3.select('#yr_lines').append('g')
			.attr("class", "svgTitle")
			.attr("transform", "translate(" + margin.left + "," + (margin.top / 2) + ")")
			.append("text")
				.text(data[0].nice_title + ' (' + data[0].GENRE + ')')
				.style('font-size', 20)
				.style('fill', 'white')
				.transition()
				.duration(1000)
				.style('fill','black');
		
		//console.log(data);
		console.log(data[0].nice_title + ' (' + data[0].GENRE + ')');
	
		var fys = [];
		data.forEach(function(d,i) {fys.push(d['FISCAL_YEAR']);});
		var xRange = d3.extent(fys);

		var amounts = [];
		data.forEach(function(d,i) {amounts.push(d['revenue']);});
		var yRange = d3.extent(amounts);

		x.domain([xRange[0], xRange[1]]);
		y.domain([d3.min([0,yRange[0]]), yRange[1]]).nice();
		
		var yr_svg = d3.select(".yr_lines_g");
		
		if(xRange[0] == xRange[1]){
			x.domain([Number(xRange[0])-1, Number(xRange[1]) +1]);
			var tvf = d3.range(Number(xRange[0])-1, Number(xRange[1]) +2, 1);
		} else {
			x.domain([Number(xRange[0])-1, Number(xRange[1]) +1]);
			var tvf = d3.range(Number(xRange[0])-1, Number(xRange[1]) +2, 1);
		}
		
		
		yr_svg.select(".x_axis")
					.transition()
					.duration(1000)
						.call(d3.axisBottom(x)
							.tickFormat(d3.format("d"))
							.tickValues(tvf));

		yr_svg.select(".y_axis")
			.transition()
						.duration(1000)
							.call(d3.axisLeft(y)
							.tickFormat(d3.format(".2s")));
								
		yr_svg.select('#x_grid')			
		  .transition()
		  .duration(1000)
			  .call(d3.axisBottom(x)
				  .tickSize(-height)
				  .tickValues(tvf)
				  .tickFormat(""));

		yr_svg.select('#y_grid')
		  .transition()
		  .duration(1000)
		  .call(d3.axisLeft(y)
			  .tickSize(-width)
			  .tickFormat(""));
							
		var amtLine = d3.line()	
			.x(function(d) { return x(d['FISCAL_YEAR']); })
			.y(function(d) { return y(d['revenue']); });
		
		var dataNest = d3.nest()
			.key(function(d) {return d['SEASON_NUM']; })
			.entries(data);
			
		yr_svg.selectAll(".line")
			.transition()
			.duration(1500)
				.style("stroke-width", 0)
				.remove();
		
		yr_svg.selectAll(".dot")
			.transition()
			.duration(1500)
				.attr("r", 0)
				.remove();
				
		var remove_ht = function(d){ return d.replace('#','P')}
		var remove_ht_d = function(d){ return d.replace('#','D')}
				
		 dataNest.forEach(function(d,i) { 

			var path = yr_svg.append("path")
				.attr("id", function() {return remove_ht(color(d.key));})
				.attr("class", "line")
				.style("stroke", function() { // Add the colours dynamically
					return d.color = color(d.key); })
				.style("fill", "none")
				.style("stroke-width", 3)
				.style("stroke-opacity", 0.85)
				.attr("d", amtLine(d.values));
				
			 var totalLength = path.node().getTotalLength();

			path.attr("stroke-dasharray", totalLength + " " + totalLength)
				.attr("stroke-dashoffset", totalLength)
				.transition("draw2")
					.duration(1500)
					.ease(d3.easeSin)
					.attr("stroke-dashoffset", 0);
		});
		
		var seasons = [];
			data.forEach(function(d,i) {seasons.push(d['SEASON_NUM']);});
		
		var lbl  = function(lab){
			return  'Season ' + lab;
		}
		
		var seasonstt = [];
			data.forEach(function(d,i) {seasonstt.push(lbl(d['SEASON_NUM']));});
			
		var seasonshl = [];
			data.forEach(function(d,i) {seasonshl.push(d['SEASON_NUM']);});
			
		var f = d3.format(".2s");
		
		var tool_tip = d3.tip()
		  .attr("class", "d3-tip")
		  .offset([-8, 0])
		  .html(function(d,i) { return '<center>' + f(d[1]) + '<br>' + d[0] + '</center>'; });
		yr_svg.call(tool_tip);
		
		var highlight = function(d,i) { 
		
			var linemod = remove_ht(d);
			
			yr_svg.selectAll('#'+linemod)
				.transition()
				.duration(20)
				.style("stroke-opacity", 1)
				.style("stroke-width",5);
			
			yr_svg.selectAll('.line:not(#' + linemod + ')')
				.transition()
				.duration(20)
				.style("stroke-opacity", 0.4)
				
			var dotmod = remove_ht_d(d);
			
			yr_svg.selectAll('#'+dotmod)
				.transition()
				.duration(20)
				.attr("fill-opacity", 1);
				
			yr_svg.selectAll('.dot:not(#' + dotmod + ')')
				.transition()
				.duration(20)
				.attr("fill-opacity", 0.4)
				
			} 
		
		var unhighlight = function(d,i) { 
		
			var linemod = remove_ht(d);
			
			yr_svg.selectAll('#'+linemod)
				.transition()
				.duration(20)
				.style("stroke-opacity", 0.85)
				.style("stroke-width",3); 
				
			yr_svg.selectAll('.line:not(#' + linemod + ')')
				.transition()
				.duration(20)
				.style("stroke-opacity", 0.85)
				
			var dotmod = remove_ht_d(d);
			
			yr_svg.selectAll('#'+dotmod)
				.transition()
				.duration(20)
				.attr("fill-opacity", 0.75);
				
			yr_svg.selectAll('.dot:not(#' + dotmod + ')')
				.transition()
				.duration(20)
				.attr("fill-opacity", 0.75)
			} 
		
		yr_svg.selectAll("dot")
			.data(amounts)
			.enter().append("circle")
				.attr("id", function(d,i) {return remove_ht_d(color(seasons[i]));})
				.attr("class", "dot")
				.attr("cx", function(d,i) {return x(fys[i]); })
				.attr("cy", function(d) {return y(d); })
				.attr("r", 5.6)
				.style("fill", function(d,i) {return color(seasons[i]); })
				.attr('fill-opacity', 0.75)
				.style("stroke", "white")
				.style("stroke-width", ".03em")
					.on('mouseover', function(d,i) {tool_tip.show([seasonstt[i],d]);
											highlight(color(seasonshl[i]));
											  d3.select(this)
												.style("stroke-width", ".1em")
												.style("stroke", "black")
												.attr("r", 6)
												.attr("fill-opacity", 1);})
					.on('mouseout', function(d,i) {tool_tip.hide(d);
											unhighlight(color(seasonshl[i]));
											  d3.select(this)
												.style("stroke-width", ".03em")
												.style("stroke", "white")
												.attr("r", 5.6)
												.attr("fill-opacity", .75);});
												
		$(".legendColor").empty();
		

		
		var legend = d3.legendColor()
			.scale(color)
			.cellFilter(function(d){//console.log(d.label + $.unique(seasons));
					return $.inArray( d.label, $.unique(seasons)) + 1;})
			.shape("line")
			.shapeWidth(17)
			.labelOffset(3);
			
		yr_svg.select(".legendColor")
			.call(legend);
			
		yr_svg.selectAll(".swatch")
			.attr('stroke-width', 3.5); 
		
		}
		
		 yr_svg.selectAll('.label')
			.text(function(d){return lbl(d);});

	});		 