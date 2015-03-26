function azimuthalMap(rootScope) {
  var scale_q = 380,
    width = scale_q * 2,
    height = scale_q * 2,
    centered,
    cityAirportData,
    feature;
  rootScope.width = width
  rootScope.height = height

  var projection = d3.geo.azimuthal()
      .scale(scale_q)
      .origin([-71.03,42.37])
      .mode("orthographic");
  rootScope.projection = projection

  var circle = d3.geo.greatCircle()
      .origin(projection.origin());
  rootScope.circle = circle

  var scale = {
    orthographic: scale_q,
    stereographic: scale_q,
    gnomonic: scale_q,
    equidistant: scale_q / Math.PI * 2,
    equalarea: scale_q / Math.SQRT2
  };
  rootScope.scale = scale

  var path = d3.geo.path()
      .projection(projection);
  rootScope.path = path

  var svg = d3.select(".map").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible")
      .on("mousedown", mousedown);
  rootScope.svg = svg

  var m0,
      o0;
  rootScope.m0 = m0
  rootScope.o0 = o0
 
  function mousedown() {
    m0 = [d3.event.pageX, d3.event.pageY];
    o0 = projection.origin();
    d3.event.preventDefault();
  }
  // Groups
  var geoGroup = svg.append("g").attr("id", "geo-paths")

  // Draw the world
  d3.json("data/world-countries.json", function(collection) {
    feature = geoGroup.selectAll("path").data(collection.features).enter().append("svg:path")
      .attr("d", clip)
      // TODO: add me back
      //.on("click", zoom);

    feature.append("svg:title")
        .text(function(d) { return d.properties.name; });
  });

  d3.select(window)
      .on("mousemove", mousemove)
      .on("mouseup", mouseup);

  d3.select("select").on("change", function() {
    projection.mode(this.value).scale(scale[this.value]);
    refresh(750);
  });

  // MOVE THE WORLD AROUND
  function mousemove() {
    if (m0) {
      var m1 = [d3.event.pageX, d3.event.pageY],
          o1 = [o0[0] + (m0[0] - m1[0]) / 8, o0[1] + (m1[1] - m0[1]) / 8];
      projection.origin(o1);
      circle.origin(o1)
      refresh();
    }
  }

  function mouseup() {
    if (m0) {
      mousemove();
      m0 = null;
    }
  }

  function refresh(duration) {
    duration ? d3.selectAll('path').transition().duration(duration).attr("d", clip) : d3.selectAll('path').attr("d", clip)
  }

  function clip(d) {
    return path(circle.clip(d));
  }
  rootScope.clip = clip

  // This should get re-written when data enters the picture
  function zoom(d) {
    var x, y, k;

    if (d && centered !== d) {
      var centroid = path.centroid(d);
      x = centroid[0];
      y = centroid[1];
      k = 4;
      centered = d;
    } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
    }
    var allPaths = d3.selectAll('path')
    allPaths.classed("active", centered && function(d) { return d === centered; });

    allPaths.transition()
        .duration(750)
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        .style("stroke-width", 1.5 / k + "px");
  }
}