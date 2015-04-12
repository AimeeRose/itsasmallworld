function chartCities(rootScope) {
  // TODO: Add each row by ticks
  var tick = undefined;

  var width = $('.main').innerWidth() - 120, // padding + 40
      height = 5000;

  var svg = d3.select(".charts").append("svg")
    .attr({
      width: width,
      height: height
    }).append("g").attr("transform", "translate(70,70)");

  var rowHeight = 100;
  var rowWidth = 0;
  var rowItemMargin = 10;
  var rowMargin = 50;

  var createPopulationDensityGrid = function(city, yheight) {
    // A mini grid for representing density
    var popDensityGrid = d3.layout.grid()
      .bands()
      .size([rowHeight,rowHeight])
      .padding([0.1, 0.1]);

    // Create a group for the little squares
    // TODO: Add mouseover for density
    var densityGroup = svg.append('g').attr('id', city.UrbanArea + '-density')
      .attr("transform", function(d) { return "translate(" + 0 + "," + yheight + ")"; })
    
    // An array of ints representing the density. The more ints the greater the density.
    var density = _.map(_.range(city.Density / 100), function(v) { return {'idx': v} })

    // Fill in the group with the density
    var rect = densityGroup.selectAll(".rect")
      .data(popDensityGrid(density));
    rect.enter().append("rect")
      .attr("class", "rect")
      .attr("width", popDensityGrid.nodeSize()[0])
      .attr("height", popDensityGrid.nodeSize()[1])
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .style("opacity", 1);
  }

  d3.csv("data/demographia-populations.csv", function(data) {
    populationDensities = _.select(data, function(city) { return city.Population > 3000000 });

    var yheight = 0;

    var transform = [0,0]
    _.each(populationDensities, function(city) {
      createPopulationDensityGrid(city, yheight);
      yheight += rowHeight + rowMargin;
    })
  });
}
