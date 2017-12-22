var margin = {top: 20, right:20, bottom: 60, left: 60},
  width = $(window).width() * .9 - margin.left - margin.right,
  height = $(window).height() * .9 - margin.top - margin.bottom

var x = d3.scaleLinear()
  .range([0,width]);

var y = d3.scaleLinear()
  .range([height,0]);

var size = d3.scaleLinear()
  .range([5,30])

var color = d3.scaleSequential(d3.interpolateYlGn);

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

var hide_labs = function(d,i){
  svg.selectAll('.bublab')
  .transition()
  .duration(10)
  .style('font-size', '0px');
}

var show_labs = function(d,i){
  svg.selectAll('.bublab')
  .transition()
  .duration(10)
  .style('font-size', '8px');
}

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

    var ntype = [];
    data.forEach(function(d,i) {ntype.push(d['n_type']);});

    var xRange = d3.extent(nof);
    var yRange = d3.extent(noe);
    var cRange = d3.extent(apr);
    var sRange = d3.extent(empl);

    x.domain([xRange[0] - (xRange[1] - xRange[0])*.1, xRange[1]*1.1]).nice();
    y.domain([yRange[0] - (yRange[1] - yRange[0])*.1, yRange[1]*1.1]).nice();
    color.domain([cRange[0], cRange[1]*1.25]);
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
      .attr('fill-opacity', 0.7)
      .style("stroke-width", ".005em")
      .attr('stroke', function(d,i) {return color(apr[i]);}) //firms,estabs,payroll,empls,desc
        .on('mouseover', function(d,i) {tool_tip.show([nof[i],noe[i],apr[i],empl[i],desc[i]]);
                      hide_labs();
                      d3.select(this)
                      //.transition()
                      //.duration(50)
                      //.ease(d3.easeExp)
                      .style("stroke-width", ".1em")
                      .attr("fill-opacity", 1);})
        .on('mouseout', function(d,i) {tool_tip.hide();
                      show_labs();
										  d3.select(this)
                      //.transition()
                      //.duration(50)
                      //.ease(d3.easeExp)
                      .style("stroke-width", ".005em")
											.attr("fill-opacity", .7);})
				.on('click', function(d,i) {var bubble_click = [prnt[i],ntype[i]];
                      bubble_loc = [x(d),y(noe[i])]; parent_select = add_under(prnt[i]);
											Shiny.onInputChange("bubble_click", bubble_click); })
        .transition()
          .duration(1500)
          .ease(d3.easeCircle)
          .attr('r', function(d,i) {return size(empl[i]);});

    svg.selectAll('bublab')
      .data(desc)
      .enter().append("text")
        .attr('class', 'bublab')
        .attr('y', function(d,i) {return y(noe[i]) - size(empl[i])*1.25;})
        .attr('x', function(d,i) {return x(nof[i]) - size(empl[i])*1.25;})
        .style('font-size', '0px')
        .style('fill', '#BEBEBE')
        .text(function(d,i) {return d;})
        .transition()
        .duration(500)
        .delay(1000)
        .style('font-size', '8px');

    svg.append("text")
      .attr('transform', 'rotate(-90)')
      .attr('y', 0-margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor','middle')
      .style('fill', '#BEBEBE')
      .text('Number of Establishments');

      svg.append("text")
        .attr('transform', 'translate(' + (width/2) + ' ,' +
                            (height + margin.top + 25) + ')')
        .style('text-anchor','middle')
        .style('fill', '#BEBEBE')
        .text('Number of Firms');

      svg.selectAll(".tick")
      .each(function (d) {
          if ( d < 0 ) {
              this.remove();
          }
      });

  });

Shiny.addCustomMessageHandler("drill_down",
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

      var ntype = [];
      data.forEach(function(d,i) {ntype.push(d['n_type']);});

      var xRange = d3.extent(nof);
      var yRange = d3.extent(noe);
      var cRange = d3.extent(apr);
      var sRange = d3.extent(empl);

      x.domain([xRange[0] - (xRange[1] - xRange[0])*.1, xRange[1]*1.1]).nice();
      y.domain([yRange[0] - (yRange[1] - yRange[0])*.1, yRange[1]*1.1]).nice();
      color.domain([cRange[0], cRange[1]*1.25]);
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

      svg.selectAll('.bublab')
        .transition()
        .duration(500)
        .attr('fill-opacity', 0)
        .remove();

      svg.selectAll('.bubble:not(#' + parent_select + ')')
        .transition()
        .duration(1600)
        .ease(d3.easeCircle)
        .attr('r',0)
        .remove()

      svg.selectAll('#' + parent_select)
        .transition()
        .duration(1600)
        .ease(d3.easeCircle)
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .attr('r', function(d) {return d3.select(this).attr('r')*10;})
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
        .style("stroke-width", ".005em")
        .attr('stroke', function(d,i) {return color(apr[i]);}) //firms,estabs,payroll,empls,desc
        .on('mouseover', function(d,i) {tool_tip.show([nof[i],noe[i],apr[i],empl[i],desc[i]]);
                      hide_labs()
                      d3.select(this)
                      //.transition()
                      //.duration(50)
                      //.ease(d3.easeExp)
                      .style("stroke-width", ".1em")
                      .attr("fill-opacity", 1);})
        .on('mouseout', function(d,i) {tool_tip.hide();
                      show_labs();
										  d3.select(this)
                      //.transition()
                      //.duration(50)
                      //.ease(d3.easeExp)
                      .style("stroke-width", ".005em")
											.attr("fill-opacity", .7);})
          .on('click', function(d,i) {if (ntype[i] != 6){
                        var bubble_click = [prnt[i],ntype[i]]; console.log(bubble_click);
                        bubble_loc = [x(d),y(noe[i])]; parent_select = add_under(prnt[i]);
                        Shiny.onInputChange("bubble_click", bubble_click); }})
        .transition()
          .duration(1600)
          .delay(400)
          .ease(d3.easeBounce)
          .attr('r', function(d,i) {return size(empl[i]);})
          .attr('cx', function(d,i) {return x(d);})
          .attr('cy', function(d,i) {return y(noe[i]);});

        svg.selectAll('bublab')
          .data(desc)
          .enter().append("text")
            .attr('class', 'bublab')
            .attr('y', function(d,i) {return y(noe[i]) - size(empl[i])*1.25;})
            .attr('x', function(d,i) {return x(nof[i]) - size(empl[i])*1.25;})
            .style('font-size', '0px')
            .style('fill', '#BEBEBE')
            .text(function(d,i) {return d;})
            .transition()
            .duration(500)
            .delay(1500)
            .style('font-size', '8px');

        svg.selectAll(".tick")
        .each(function (d) {
            if ( d < 0 ) {
                this.remove();
            }
        });
  })

  Shiny.addCustomMessageHandler("refresh",
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

        var ntype = [];
        data.forEach(function(d,i) {ntype.push(d['n_type']);});

        var xRange = d3.extent(nof);
        var yRange = d3.extent(noe);
        var cRange = d3.extent(apr);
        var sRange = d3.extent(empl);

        x.domain([xRange[0] - (xRange[1] - xRange[0])*.1, xRange[1]*1.1]).nice();
        y.domain([yRange[0] - (yRange[1] - yRange[0])*.1, yRange[1]*1.1]).nice();
        color.domain([cRange[0], cRange[1]*1.25]);
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

        svg.selectAll('.bublab').remove();

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
          .style("stroke-width", ".005em")
          .attr('stroke', function(d,i) {return color(apr[i]);}) //firms,estabs,payroll,empls,desc
          .on('mouseover', function(d,i) {tool_tip.show([nof[i],noe[i],apr[i],empl[i],desc[i]]);
                        hide_labs()
                        d3.select(this)
                        //.transition()
                        //.duration(50)
                        //.ease(d3.easeExp)
                        .style("stroke-width", ".1em")
                        .attr("fill-opacity", 1);})
          .on('mouseout', function(d,i) {tool_tip.hide();
                        show_labs()
  										  d3.select(this)
                        //.transition()
                        //.duration(50)
                        //.ease(d3.easeExp)
                        .style("stroke-width", ".005em")
  											.attr("fill-opacity", .7);})
            .on('click', function(d,i) {var bubble_click = [prnt[i],ntype[i]];
                          bubble_loc = [x(d),y(noe[i])]; parent_select = add_under(prnt[i]);
                          Shiny.onInputChange("bubble_click", bubble_click); })
          .transition()
            .duration(1500)
            .delay(400)
            .ease(d3.easeElastic)
            .attr('r', function(d,i) {return size(empl[i]);});

        svg.selectAll('bublab')
          .data(desc)
          .enter().append("text")
            .attr('class', 'bublab')
            .attr('y', function(d,i) {return y(noe[i]) - size(empl[i])*1.25;})
            .attr('x', function(d,i) {return x(nof[i]) - size(empl[i])*1.25;})
            .style('font-size', '0px')
            .style('fill', '#BEBEBE')
            .text(function(d,i) {return d;})
            .transition()
            .duration(500)
            .delay(1000)
            .style('font-size', '8px');

          svg.selectAll(".tick")
          .each(function (d) {
              if ( d < 0 ) {
                  this.remove();
              }
          });
    })
