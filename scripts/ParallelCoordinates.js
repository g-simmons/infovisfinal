function ParallelCoordinates(svg, dimensions, _data = data) {
    this.svg = svg;
    var mouseStatus = {};

    var margins = {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
    }

    //  grab the width and height of our containing SVG
    var width = svg.node().getBoundingClientRect().width - margins.right - margins.left;
    var height = svg.node().getBoundingClientRect().height - margins.top - margins.bottom;
 
    var background = svg.append("g").attr("class", "background");
    var forground = svg.append("g").attr("class", "forground");
    var grounds = [background, forground];

    // Create scales for each parallel coordinate.
    var y = d3.scaleOrdinal()
            .rangePoints([0, height])
            .domain(dimensions);

    var xs = function (scale = d3.scaleLinear().range([0, width])) {
        return dimensions.map(_ => scale.copy());
    }();

    // Add x axis
    var xAxisG = svg.append("g").attr("class", "axis");
    
    // Filter Group
    var filterG = svg.append("g").attr("class", "filters");

    // TODO: Add axis labels

    // TODO: ADD grounds styles to CSS
    var lineGen = d3.line();

    this.draw = function(data = data) {
        var dimensionData = dimensions.map((dimension,i) => {
                return {
                    index: i,
                    domain: d3.range(dimension, data)
                }
            });
            
        // Update the x scales
        xs.forEach((x, i) => x.domain(dimensionData[i].domain));

        // Draw lines
        var groundPaths = grounds.map(ground => ground.selectAll("path").data(data));
        function updateLine(selection) {
            selection.attr("d", d => {
                //Generate a line
                lineGen(dimensions.map((dimension, i) => [xs[i](d[dimension]), y(dimension)]));
            }).attr("stroke-color", color.forData)
            .classed("filtered", d => d.filtered);
        }

        groundPaths.forEach(ground => {
            updateLine(ground.enter().append("path"));
            updateLine(ground.transition());
            ground.exit().remove();
        });

        //Update the x axis
        var xAxis = xAxisG.selectAll(".xAxi")
            .data(dimensionData, d => d.index)
        
        function axisData(selection) {
            selection.call(d => d3.axisLeft(xs[d.index])
                    .tickFormat(d3.format(".0s")));
        };

        //TODO: Get single filtering working then see if multi-filtering adds value!

        axisData(xAxis.enter()
            .append("g")
            .attr("class", "xAxi")
            .attr("y", d => y(d.dimension))
            .on("mousedown", _ => {
                mouseStatus.startPosition = d3.mouse(this)[0];
           })
            .on("mousemove", d => {
                if (mouseStatus.startPosition) {
                    mouseStatus.moved = true;

                    // Update/set the filter
                    var dimension = dimensions[d.index];
                    var x = xs[d.index];
                    filter.set(dimension, [x.invert(mouseStatus.startPosition), x.invert(d3.mouse(this)[0])]);
                }
            })
            .on("mouseup", d => {
                if (!mouseStatus.moved) {
                    var dimension = dimensions[d.index];
                    
                    //Reset all filter with key dimension
                    filter.clear(dimension);
                }
            }));
        axisData(xAxis.transition());
        xAxis.exit().remove();

        // Draw Filters
        var filters = filterG.selectAll("g")
            .data(dimensions.map((_, i) => i))
            .enter()
            .append("g")
            .attr("transform", index => "translate(0, " + y(dimensions[index]) + ")")
            .selectAll("line")
            // Get the filters and convert the filter values to positions 
            .data(index => filter.get(dimensions[index]).map(filt => filt.map(val => xs[index](val))));

        function filterData(selection) {
            selection.attr("x1", d => d[0])
                .attr("x2", d => d[1])
        }

        filterData(filters.enter().append("line"));
        filterData(filters);
        filters.exit().remove();
    }
    
    this.draw(_data);
}