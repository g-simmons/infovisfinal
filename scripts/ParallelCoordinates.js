function ParallelCoordinates(svg, dimensions, _data = data) {
    this.svg = svg;
    var margins = {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
    }
    //  grab the width and height of our containing SVG
    var width = svg.node().getBoundingClientRect().width - margins.right - margins.left;
    var height = svg.node().getBoundingClientRect().height - margins.top - margins.bottom;
 
    // Create scales for each parallel coordinate.
    var y = d3.scale.ordinal()
            .rangePoints([0, height])
            .domain(dimensions);

    var xs = function (scale = d3.scale.linear().range([0, width])){
        return dimensions.map(_ => scale.copy());
    }();

    // Add x axis
    var xAxisG = svg.append("g").attr("class", "axis");

    this.draw = function(data = data) {
        var dimensionData = dimensions.map((dimension,i) => {
                return {
                    index: i,
                    domain = d3.range(dimension, data),
                }
            });
            
        // Update the x scales
        xs.forEach((x, i) => x.domain(dimensionData[i].domain));

        //Update the x axis
        var xAxis = xAxisG.selectAll(".xAxi")
            .data(dimensionData, d => d.index)
        
        function axisData(selection) {
            selection.call(d => d3.axisLeft(xs[d.index])
                    .tickFormat(d3.format(".0s")));
        };

        axisData(xAxis.enter()
            .append("g")
            .attr("class", "xAxi")
            .attr("y", d => y(d.dimension)));
        axisData(xAxis.transition());


    }
    
    this.draw(_data);
}