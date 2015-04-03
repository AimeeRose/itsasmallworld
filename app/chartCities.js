function chartCities(rootScope) {
  var svg = d3.select(".charts").append("svg:svg")
      .attr("width", 1000)
      .attr("height", 1200)
  rootScope.svg = svg

  var populationsGroup = svg.append('g').attr('id', 'cityPopulations')
  var cx = 0
  d3.tsv("data/urbanareas1_1.tsv", function(data) {
    // select 5 cities
    // make a grid

    populationsGroup.selectAll('circle').data(data).enter()
      .append('circle')
      .attr('r', function(d) { return d.pop2015 / 100})
      .attr('fill', 'yellow')
      .attr('cx', function(d) { cx += d.pop2015 / 100; return cx })
      .attr('cy', 100)
  });
}
