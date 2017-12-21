var margin = {top: 20, right:20, bottom: 50, left: 50},
  width = $(window).width() * .75 - margin.left - margin.right,
  height = 600 - margin.top - margin.right

var x = d3.scaleLinear()
  .range([0,width]);

var y = d3.scaleLinear()
  .range([height,0]);

var color = d3.scaleSequential(d3.interpolateWarm);

var svg = d3.select('#div_bubble')
  .append('svg')
    .attr('id', 'svg_bubble')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.left)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('id', 'g_bubble')

Shiny.addCustomMessageHandler("two_char",
  function(data){

    console.log(data);

    var apr = [];
    data.forEach(function(d,i) {apr.push(d['APR']);});

    var empl = [];
    data.forEach(function(d,i) {empl.push(d['EMPLOYMENT']);});

    var noe = [];
    data.forEach(function(d,i) {noe.push(d['NUMBER_OF_ESTABLISHMENTS']);});

    var nof = [];
    data.forEach(function(d,i) {nof.push(d['NUMBER_OF_FIRMS']);});

    console.log(apr);

    var xRange = d3.extent(nof);
    var yRange = d3.extent(noe);
    var cRange = d3.extent(apr);

    x.domain([xRange[0], xRange[1]*1.15]).nice();
    y.domain([yRange[0], yRange[1]*1.15]).nice();
    color.domain([cRange[0], cRange[1]]);

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
        .ticks(5)
        .tickFormat(""));

    svg.append("g")
      .attr("id", "y_grid")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(""));

    svg.selectAll('bubble')
      .data(nof)
      .enter().append("circle")
      .attr('class', 'bubble')
      .attr('cx', function(d,i) {return x(d);})
      .attr('cy', function(d,i) {return y(noe[i]);})
      .attr('r', function(d,i) {return empl[i]/300000;})
      .style('fill', function(d,i) {return color(apr[i]);})
      .attr('fill-opacity', 0.7)


  })
