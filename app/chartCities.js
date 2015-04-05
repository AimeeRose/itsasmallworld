var populationPoints = [];
function chartCities(rootScope) {
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

  function update() {
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

  function push() {
    //populationPoints.push({});
    update();
    if (populationPoints.length > 15) {
      clearInterval(tick);
      tick = setInterval(pop, 500);
    }
  }

  function pop() {
    populationPoints.pop();
    update();
    if (populationPoints.length < 2) {
      clearInterval(tick);
      tick = setInterval(push, 500);
    }
  }

  //var populationsGroup = svg.append('g').attr('id', 'cityPopulations')
  d3.tsv("data/urbanareas1_1.tsv", function(data) {
    populationPoints = _.select(data, function(city) { return city.pop2015 > 3000 });
    update();
  });
}
