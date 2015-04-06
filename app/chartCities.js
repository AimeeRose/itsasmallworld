function chartCities(rootScope) {
  var populationPoints = [];
  var tick = undefined;

  var width = $('.main').innerWidth() - 120, // padding + 40
      height = 1200;

  var pointGrid = d3.layout.grid()
    .points()
    .size([width, 500]);

  var svg = d3.select(".charts").append("svg")
    .attr({
      width: width,
      height: height
    }).append("g").attr("transform", "translate(70,70)");

  var cityTooltip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) { return d.City + ', ' + d.Country });
  svg.call(cityTooltip);

  function updatePopulations() {
    var point = svg.selectAll(".point")
      .data(pointGrid(populationPoints));
    point.enter().append("circle")
      .attr("fill", "skyblue")
      .attr("class", "point")
      .attr("r", 1e-6)
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .on("mouseover", cityTooltip.show)
      .on("mouseout", cityTooltip.hide);
    point.transition()
      .attr("r", function(d) { return d.pop2015 / 1000});
  }

  //var populationsGroup = svg.append('g').attr('id', 'cityPopulations')
  d3.tsv("data/urbanareas1_1.tsv", function(data) {
    populationPoints = _.select(data, function(city) { return city.pop2015 > 3000 });
    updatePopulations();
  });

  var populationDensities = [];
  // var rectGrid = d3.layout.grid()
  //   .bands()
  //   .size([width, 500])
  //   .padding([0.1, 0.1]);

  var densitiesGroup = svg.append('g').attr('id', 'densitiesPopulation')
    .attr("transform", function(d) { return "translate(" + 0 + "," + 540 + ")"; })

  function updateDensities() {
    var rect = densitiesGroup.selectAll(".rect")
      .data(rectGrid(populationDensities));
    rect.enter().append("rect")
      .attr("class", "rect")
      .attr("width", rectGrid.nodeSize()[0])
      .attr("height", rectGrid.nodeSize()[1])
      .attr("transform", function(d) { return "translate(" + 0+ "," + d.y + ")"; })
      .style("opacity", 1e-6);
    rect.transition()
      .attr("width", rectGrid.nodeSize()[0])
      .attr("height", rectGrid.nodeSize()[1])
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style("opacity", 1);
  }

  d3.csv("data/demographia-populations.csv", function(data) {
    populationDensities = _.select(data, function(city) { return city.Population > 3000000 });
    //updateDensities();

    var rectGrid = d3.layout.grid()
      .bands()
      .size([100,100])
      .padding([0.1, 0.1]);

    var transform = [0,0]
    _.each(populationDensities, function(city) {
      // create a group
      var densityGroup = svg.append('g').attr('id', city.UrbanArea)
        .attr("transform", function(d) { return "translate(" + transform[0] + "," + transform[1] + ")"; })
      transform[0] += 100; transform[1] += 100

      var density = _.map(_.range(city.Density / 100), function(v) { return {'idx': v} })

      // fill in the group with the density
      var rect = densityGroup.selectAll(".rect")
        .data(rectGrid(density));
      rect.enter().append("rect")
        .attr("class", "rect")
        .attr("width", rectGrid.nodeSize()[0])
        .attr("height", rectGrid.nodeSize()[1])
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
        .style("opacity", 1);

    })
  });
}
