function ScatterPlot(svg, _data = data) {
    console.log(svg);
    
    this.svg = svg;
    var mouseStatus = {};

    var margins = {
        top: 40,
        bottom: 60,
        left: 200,
        right: 20
    }

    var legend_dims = {
        left: 20,
        rect_size: 18,
        rect_pad: 2
    }
    
    //  grab the width and height of our containing SVG
    var width = svg.node().getBoundingClientRect().width - margins.right - margins.left;
    var height = svg.node().getBoundingClientRect().height - margins.top - margins.bottom;
 
    var background = svg.append("g").attr("class", "background").attr("transform", "translate(" + margins.left + ", " + margins.top + ")");
    var forground = svg.append("g").attr("class", "forground").attr("transform", "translate(" + margins.left + ", " + margins.top + ")");
    var grounds = [background, forground];

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);




    this.draw = function (__data = _data, x_var = 'ax1', y_var = 'ax2', colorby = 'food_group') {
        // Scale the range of the data
        x.domain(d3.extent(__data, function(d) { return d[x_var]; }));
        y.domain(d3.extent(__data, function(d) { return d[y_var]; }));
    
        // create a color scheme
        var color = d3.scaleOrdinal(d3.schemeCategory20);
    
        // Add the scatterplot
        var circles = svg.selectAll("dot")
            .data(__data)
            .enter().append("circle")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
            .attr("r", 4)
            .attr("cx", function(d) { return x(d[x_var]); })
            .attr("cy", function(d) { return y(d[y_var]); })
            .style("fill", function(d) { return color(d[colorby]); })
            .style("opacity", 0.8);

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(" + margins.left + "," + (height + margins.top) + ")")
            .style('font-family','"Lato",sans-serif')
            .call(d3.axisBottom(x).ticks(11,".0s"))
        
        // X axis label
        svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margins.bottom + margins.top) + ")")
            .style("text-anchor", "middle")
            .attr("fill", "black")
            .text(x_var)
            .style('font-family','sans-serif')
            .style('font-size','14px')
            .style('font-weight','700')
            .attr('dy','-10');
        
        // Add the Y Axis
        svg.append("g")
            .attr("transform", "translate(" + margins.left + "," + margins.top + ")")
            .call(d3.axisLeft(y));
            
        // Y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", margins.left - 45 )
            .attr("x",0 - (height / 2))
            .style("text-anchor", "middle")
            .attr("fill", "black")
            .text(y_var)
            .style('font-family','sans-serif')
            .style('font-size','14px')
            .style('font-weight','700')
            .attr('dy','15');
            
        //legend
        var legend = svg.selectAll('legend')
            .attr('width',100)
            .data(color.domain())
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d,i){ return 'translate(0,' + i * (legend_dims.rect_size + legend_dims.rect_pad) + ')'; });

        legend.append('rect')
            .attr('x', legend_dims.left)
            .attr('width', legend_dims.rect_size)
            .attr('height', legend_dims.rect_size)
            .style('fill', color);

        legend.append('text')
            .attr('x', 50)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'start')
            .style('font-family','sans-serif')
            .style('font-size','11px')
            .text(function(d){ return d; });

        //title
        svg.append("text")
            .attr("x", (width / 2))             
            .attr("y", 0 + (margins.top / 2))
            .attr("text-anchor", "middle")  
            .style("font-size", "16px") 
            .style("text-decoration", "underline")  
            .style('font-weight','700')
            .style('font-family','sans-serif')
            .text("T-SNE");




    var lasso_start = function() {
        lasso.items()
            .attr("r",3.5) // reset size
            .classed("not_possible",true)
            .classed("selected",false);
    };

    var lasso_draw = function() {
    
        // Style the possible dots
        lasso.possibleItems()
            .classed("not_possible",false)
            .classed("possible",true);

        // Style the not possible dot
        lasso.notPossibleItems()
            .classed("not_possible",true)
            .classed("possible",false);
    };

    var lasso_end = function() {
        // Reset the color of all dots
        lasso.items()
            .classed("not_possible",false)
            .classed("possible",false);

        // Style the selected dots
        lasso.selectedItems()
            .classed("selected",true)
            .attr("r",7);

        // Reset the style of the not selected dots
        lasso.notSelectedItems()
            .attr("r",3.5);

    };
    
    var lasso = d3.lasso()
        .closePathSelect(true)
        .closePathDistance(100)
        .items(circles)
        .targetArea(svg)
        .on("start",lasso_start)
        .on("draw",lasso_draw)
        .on("end",lasso_end);
    
    svg.call(lasso);
    }
    
    this.draw(_data);
}