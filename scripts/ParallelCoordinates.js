function ParallelCoordinates(svg, dimensions, _data = data) {
    
    this.svg = svg;
    var mouseStatus = {};

    var margins = {
        top: 40,
        bottom: 60,
        left: 20,
        right: 20
    }
    
    //  grab the width and height of our containing SVG
    var width = svg.node().getBoundingClientRect().width - margins.right - margins.left;
    var height = svg.node().getBoundingClientRect().height - margins.top - margins.bottom;
 
    var background = svg.append("g").attr("class", "background").attr("transform", "translate(" + margins.left + ", " + margins.top + ")");
    var forground = svg.append("g").attr("class", "forground").attr("transform", "translate(" + margins.left + ", " + margins.top + ")");
    var grounds = [background, forground];

    // Create scales for each parallel coordinate.
    var y = d3.scalePoint()
        .range([0, height])
        .domain(dimensions);

    var xs = function (scale = d3.scaleLinear().range([0, width])) {
        return dimensions.map(_ => scale.copy());
    }();

    // Add x axis
    var xAxisG = svg.append("g").attr("class", "axis").attr("transform", "translate(" + margins.left + ", " + margins.top + ")");
    
    // Filter Group
    var filterG = svg.append("g").attr("class", "filters").attr("transform", "translate(" + margins.left + ", " + margins.top + ")");
    var filtersG = filterG.selectAll("g").data(dimensions.map((_, i) => i)).enter().append("g").attr("transform", index => "translate(0, " + y(dimensions[index]) + ")");
    
    var lineGen = d3.line();

    this.draw = function (__data = _data) {
        var dimensionData = dimensions.map((dimension,i) => {
                return {
                    index: i,
                    domain: d3.range(dimension, __data)
                }
            });
            
        // Update the x scales
        xs.forEach((x, i) => x.domain(dimensionData[i].domain));

        // Draw lines
        var groundPaths = grounds.map(ground => ground.selectAll("path").data(data));
        function updateLine(selection, background) {
            //Generate a line
            selection.attr("d", d => lineGen(dimensions.map((dimension, i) => [xs[i](d[dimension]), y(dimension)])))
                .attr("stroke", d => background ? "black" : color.forData(d))
                .attr("class", d => d.filtered ? "filtered" : "");
        }

        groundPaths.forEach((ground, i) => {
            updateLine(ground.enter().append("path"), i == 0);
            updateLine(ground.transition(), i == 0);
            ground.exit().remove();
        });

        //Update the x axis
        var xAxis = xAxisG.selectAll(".xAxi")
            .data(dimensionData, d => d.index)
        
        function axisData(selection) {
            selection.each(function (d, i) {
                d3.select(this).call(
                    d3.axisBottom(xs[d.index]).tickFormat(d3.format(".0s"))
                );
            })
            .attr("transform", d => "translate(0, " + y(dimensions[d.index]) + ")");
            
            selection.select(".title").text(d => title(dimensions[d.index]));
        };

        var xAxisEnter = xAxis.enter()
            .append("g")
            .attr("class", "xAxi")
            .attr("y", d => y(d.dimension));
        
            xAxisEnter.append("rect")
                .attr("width", width + 40)
                .attr("y", -31)
                .attr("fill", "transparent")
                .attr("height", 62)
                .attr("x", -20)
                .call(
                    d3.drag().on("start", function (d) {
                        
                        mouseStatus.startPosition = d3.event.x;
                        // Disable interactions with filters 
                        filterG.style("pointer-events", "none");

                        if (shiftKeyPressed) {
                            mouseStatus.editing = filter.add(dimensions[d.index]);
                        } else {
                            mouseStatus.editing = null;
                        }
                    }).on("drag", function (d) {
                        if (mouseStatus.startPosition) {

                            // Update/set the filter
                            var dimension = dimensions[d.index];
                            var x = xs[d.index];
                            filter.set(dimension, [x.invert(mouseStatus.startPosition), x.invert(d3.event.x)], true, mouseStatus.editing);
                        }
                    }).on("end", function(d) {                        
                        filterG.style("pointer-events", null);

                        if (Math.abs(mouseStatus.startPosition - d3.event.x) < 2) {
                            var dimension = dimensions[d.index];

                            //Reset all filter with key dimension
                            filter.clear(dimension);
                        }
                        mouseStatus.startPosition = false;
                    })
                );
        xAxisEnter.append("text").attr("class", "title");

        axisData(xAxisEnter);
        axisData(xAxis.transition());
        xAxis.exit().remove();

        // Draw Filters
        var filters = filtersG.selectAll("g")
            // Get the filters and convert the filter values to positions 
            .data(index => {                
                return filter.get(dimensions[index]).map((filt, i) => {
                    return {
                        xy: filt.map(val => xs[index](val)),
                        fIndex: i,
                        index: index
                    }
                });
            })
            .attr("transform", "translate(0, -0.5)");

        function filterData(selection) {
            selection.select("line").attr("x1", d => Math.max(Math.min(width, d.xy[0]), 0))
                .attr("x2", d => Math.max(Math.min(width, d.xy[1]), 0));
            selection.select(".resizer.left").attr("x", d => Math.max(Math.min(width, d.xy[0]), 0) - 5)
            selection.select(".resizer.right").attr("x", d => Math.max(Math.min(width, d.xy[1]), 0) - 5)
        }

        var filtersEnter = filters.enter().append("g").attr("class", "filterBox")
        filtersEnter.append("line").call(
            d3.drag().on("drag", function (d) {
                // Update/set the filter
                var dimension = dimensions[d.index];
                var x = xs[d.index];
                var newRange = filter.get(dimension)[d.fIndex].map(f => x.invert(x(f) + d3.event.dx));
                filter.set(dimension, newRange, true, d.fIndex);
            })
        );

        filtersEnter.append("rect")
            .attr("class", "resizer left")
            .attr("width", 10)
            .attr("height", 14)
            .attr("y", -7)
            .call(
                d3.drag().on("drag", function (d) {
                    // Update/set the filter
                    var dimension = dimensions[d.index];
                    var x = xs[d.index];
                    var filterRange = filter.get(dimension)[d.fIndex];
                    filterRange[0] = x.invert(x(filterRange[0]) + d3.event.dx);
                    filter.set(dimension, filterRange, true, d.fIndex);
                })
            );
        filtersEnter.append("rect")
            .attr("class", "resizer right")
            .attr("width", 10)
            .attr("height", 14)
            .attr("y", -7)
            .call(
                d3.drag().on("drag", function (d) {
                    // Update/set the filter
                    var dimension = dimensions[d.index];
                    var x = xs[d.index];
                    var filterRange = filter.get(dimension)[d.fIndex];
                    filterRange[1] = x.invert(x(filterRange[1]) + d3.event.dx);
                    filter.set(dimension, filterRange, true, d.fIndex);
                })
            );

        filterData(filtersEnter);
        filterData(filters);
        filters.exit().remove();
    }
    
    this.draw(_data);
}