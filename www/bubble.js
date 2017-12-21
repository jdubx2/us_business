var margin = {top: 20, right:20, bottom: 50, left: 50},
  width = $(window).width() * .9 - margin.left - margin.right,
  height = $(window).height() * .9 - margin.top - margin.right

var x = d3.scaleLinear()
  .range([0,width]);

var y = d3.scaleLinear()
  .range([height,0]);

var size = d3.scaleLinear()
  .range([5,30])

var color = d3.scaleSequential(d3.interpolateWarm);

//global variables for bubble selection
var bubble_loc = [0,0];
var parent_select;

//function for id conversion to non-numeric
var add_under = function(x){return '_'+x;};

//random number gen for transitions
var random_int = function randomIntFromInterval(min,max){
      return Math.floor(Math.random()*(max-min+1)+min);}

var f = d3.format(".2s");

//firms,estabs,payroll,empls,desc
var tool_tip = d3.tip()
  .attr("class", "d3-tip")
  .offset([-8, 0])
  .html(function(d,i) { return '<center><b><u>' + d[4] + '</u></b><br># Firms: ' + f(d[0]) +
                        '<br># Establishments: ' + f(d[1]) + '<br># Employees: ' + f(d[3]) +
                        '<br>Annual Payroll ($1K): ' + f(d[2]) + '</center>'; });
  //.html(function(d,i) { return d;})

var svg = d3.select('#div_bubble')
  .append('svg')
    .attr('id', 'svg_bubble')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.left)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('id', 'g_bubble')

Shiny.addCustomMessageHandler("init",
  function(data){

    //console.log(data);

    var apr = [];
    data.forEach(function(d,i) {apr.push(d['APR']);});

    var empl = [];
    data.forEach(function(d,i) {empl.push(d['EMPLOYMENT']);});

    var noe = [];
    data.forEach(function(d,i) {noe.push(d['NUMBER_OF_ESTABLISHMENTS']);});

    var nof = [];
    data.forEach(function(d,i) {nof.push(d['NUMBER_OF_FIRMS']);});

    var prnt = [];
    data.forEach(function(d,i) {prnt.push(d['parent']);});

    var desc = [];
    data.forEach(function(d,i) {desc.push(d['NAICS_DESCRIPTION']);});

    var xRange = d3.extent(nof);
    var yRange = d3.extent(noe);
    var cRange = d3.extent(apr);
    var sRange = d3.extent(empl);

    x.domain([xRange[0], xRange[1]*1.15]).nice();
    y.domain([yRange[0], yRange[1]*1.15]).nice();
    color.domain([cRange[0], cRange[1]]);
    size.domain([sRange[0], sRange[1]]);

    svg.append("g")
      .attr("class", "x_axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .tickFormat(d3.format(".2s")));

    svg.append("g")
      .attr("class", "y_axis")
      .call(d3.axisLeft(y)
        .tickFormat(d3.format(".2s")))
       .append("text")
      .attr("class", "label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em");

    svg.append("g")
      .attr("id", "x_grid")
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .tickSize(-height)
        .tickFormat(""));

    svg.append("g")
      .attr("id", "y_grid")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(""));

    svg.call(tool_tip);

    svg.selectAll('bubble')
      .data(nof)
      .enter().append("circle")
      .attr('class', 'bubble')
      .attr('id', function(d,i){return add_under(prnt[i]);})
      .attr('cx', function(d,i) {return x(d);})
      .attr('cy', function(d,i) {return y(noe[i]);})
      .attr('r', 0)
      .style('fill', function(d,i) {return color(apr[i]);})
      .attr('fill-opacity', 0.7)                          //firms,estabs,payroll,empls,desc
        .on('mouseover', function(d,i) {tool_tip.show([nof[i],noe[i],apr[i],empl[i],desc[i]]);
                      d3.select(this)
                      .style("stroke-width", ".1em")
                      //.style("stroke", "black")
                      .attr("fill-opacity", 1);})
        .on('mouseout', function(d,i) {tool_tip.hide();
										  d3.select(this)
											.style("stroke-width", ".03em")
											.style("stroke", "white")
											.attr("fill-opacity", .6);})
				.on('click', function(d,i) {var bubble_click = prnt[i];
                      bubble_loc = [x(d),y(noe[i])]; parent_select = add_under(prnt[i]);
											Shiny.onInputChange("bubble_click", bubble_click); })
        .transition()
          .duration(1500)
          .ease(d3.easeCircle)
          .attr('r', function(d,i) {return size(empl[i]);});

  });

Shiny.addCustomMessageHandler("six_char",
  function(data){

      tool_tip.hide();

      var apr = [];
      data.forEach(function(d,i) {apr.push(d['APR']);});

      var empl = [];
      data.forEach(function(d,i) {empl.push(d['EMPLOYMENT']);});

      var noe = [];
      data.forEach(function(d,i) {noe.push(d['NUMBER_OF_ESTABLISHMENTS']);});

      var nof = [];
      data.forEach(function(d,i) {nof.push(d['NUMBER_OF_FIRMS']);});

      var prnt = [];
      data.forEach(function(d,i) {prnt.push(d['parent']);});

      var desc = [];
      data.forEach(function(d,i) {desc.push(d['NAICS_DESCRIPTION']);});

      var xRange = d3.extent(nof);
      var yRange = d3.extent(noe);
      var cRange = d3.extent(apr);
      var sRange = d3.extent(empl);

      x.domain([xRange[0], xRange[1]*1.15]).nice();
      y.domain([yRange[0], yRange[1]*1.15]).nice();
      color.domain([cRange[0], cRange[1]]);
      size.domain([sRange[0], sRange[1]]);

      svg.select(".x_axis")
				.transition()
				.duration(1400)
        .delay(400)
        .call(d3.axisBottom(x)
          .tickFormat(d3.format(".2s")));

  		svg.select(".y_axis")
  			.transition()
				.duration(1400)
        .delay(400)
        .call(d3.axisLeft(y)
          .tickFormat(d3.format(".2s")))

  		svg.select('#x_grid')
  		  .transition()
  		  .duration(1400)
        .delay(400)
			  .call(d3.axisBottom(x)
				  .tickSize(-height)
				  .tickFormat(""));

  		svg.select('#y_grid')
  		  .transition()
  		  .duration(1400)
        .delay(400)
  		  .call(d3.axisLeft(y)
  			  .tickSize(-width)
  			  .tickFormat(""));

      svg.selectAll('.bubble:not(#' + parent_select + ')')
        .transition()
        .duration(1400)
        .ease(d3.easeCircle)
        .attr('r',0)
        .remove()

      svg.selectAll('#' + parent_select)
        .transition()
        .duration(1000)
        .ease(d3.easeCircle)
        .delay(400)
        .attr('fill-opacity', 0)
        .attr('r', function(d) {return d3.select(this).attr('r')*5;})
        .remove()

      svg.selectAll('bubble')
        .data(nof)
        .enter().append("circle")
        .attr('class', 'bubble')
        .attr('id', function(d,i){return add_under(prnt[i]);})
        .attr('cx', bubble_loc[0])
        .attr('cy', bubble_loc[1])
        .attr('r', 0)
        .style('fill', function(d,i) {return color(apr[i]);})
        .attr('fill-opacity', 0.7)
          .on('mouseover', function(d,i) {tool_tip.show([nof[i],noe[i],apr[i],empl[i],desc[i]]);
                        d3.select(this)
                        .style("stroke-width", ".1em")
                        //.style("stroke", "black")
                        .attr("fill-opacity", 1);})
          .on('mouseout', function(d,i) {tool_tip.hide();
                        d3.select(this)
                        .style("stroke-width", ".03em")
                        .style("stroke", "white")
                        .attr("fill-opacity", .6);})
          .on('click', function(d,i) {var bubble_click = prnt[i];
                        bubble_loc = [x(d),y(noe[i])]; parent_select = add_under(prnt[i]);
                        Shiny.onInputChange("bubble_click", bubble_click); })
        .transition()
          .duration(1500)
          .delay(400)
          .ease(d3.easeCircle)
          .attr('r', function(d,i) {return size(empl[i]);})
          .attr('cx', function(d,i) {return x(d);})
          .attr('cy', function(d,i) {return y(noe[i]);});
  })

  Shiny.addCustomMessageHandler("refresh",
    function(data){

        var apr = [];
        data.forEach(function(d,i) {apr.push(d['APR']);});

        var empl = [];
        data.forEach(function(d,i) {empl.push(d['EMPLOYMENT']);});

        var noe = [];
        data.forEach(function(d,i) {noe.push(d['NUMBER_OF_ESTABLISHMENTS']);});

        var nof = [];
        data.forEach(function(d,i) {nof.push(d['NUMBER_OF_FIRMS']);});

        var prnt = [];
        data.forEach(function(d,i) {prnt.push(d['parent']);});

        var desc = [];
        data.forEach(function(d,i) {desc.push(d['NAICS_DESCRIPTION']);});

        var xRange = d3.extent(nof);
        var yRange = d3.extent(noe);
        var cRange = d3.extent(apr);
        var sRange = d3.extent(empl);

        x.domain([xRange[0], xRange[1]*1.15]).nice();
        y.domain([yRange[0], yRange[1]*1.15]).nice();
        color.domain([cRange[0], cRange[1]]);
        size.domain([sRange[0], sRange[1]]);

        svg.select(".x_axis")
  				.transition()
  				.duration(1000)
          .call(d3.axisBottom(x)
            .tickFormat(d3.format(".2s")));

    		svg.select(".y_axis")
    			.transition()
  				.duration(1000)
          .call(d3.axisLeft(y)
            .tickFormat(d3.format(".2s")))

    		svg.select('#x_grid')
    		  .transition()
    		  .duration(1000)
    			  .call(d3.axisBottom(x)
    				  .tickSize(-height)
    				  .tickFormat(""));

    		svg.select('#y_grid')
    		  .transition()
    		  .duration(1000)
    		  .call(d3.axisLeft(y)
    			  .tickSize(-width)
    			  .tickFormat(""));

        svg.selectAll('.bubble')
          .transition()
          .duration(1000)
          .ease(d3.easeCircle)
          .attr('r',0)
          .remove()

        svg.selectAll('bubble')
          .data(nof)
          .enter().append("circle")
          .attr('class', 'bubble')
          .attr('id', function(d,i){return add_under(prnt[i]);})
          .attr('cx', function(d,i) {return x(d);})
          .attr('cy', function(d,i) {return y(noe[i]);})
          .attr('r', 0)
          .style('fill', function(d,i) {return color(apr[i]);})
          .attr('fill-opacity', 0.7)
            .on('mouseover', function(d,i) {tool_tip.show([nof[i],noe[i],apr[i],empl[i],desc[i]]);
                          d3.select(this)
                          .style("stroke-width", ".1em")
                          //.style("stroke", "black")
                          .attr("fill-opacity", 1);})
            .on('mouseout', function(d,i) {tool_tip.hide();
                          d3.select(this)
                          .style("stroke-width", ".03em")
                          .style("stroke", "white")
                          .attr("fill-opacity", .6);})
            .on('click', function(d,i) {var bubble_click = prnt[i];
                          bubble_loc = [x(d),y(noe[i])]; parent_select = add_under(prnt[i]);
                          Shiny.onInputChange("bubble_click", bubble_click); })
          .transition()
            .duration(1500)
            .delay(400)
            .ease(d3.easeElastic)
            .attr('r', function(d,i) {return size(empl[i]);});
    })
