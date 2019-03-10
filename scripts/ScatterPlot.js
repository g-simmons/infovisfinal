function ScatterPlot(svg, _data = data) {
    console.log(svg);
    
    this.svg = svg;
    var mouseStatus = {};

    var margins = {
        top: 20,
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

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    this.draw = function (__data = _data, x_var = 'ax1', y_var = 'ax2') {
        // Scale the range of the data
        x.domain(d3.extent(__data, function(d) { return d[x_var]; }));
        y.domain(d3.extent(__data, function(d) { return d[y_var]; }));
    
        // create a color scheme
        var color = d3.scaleOrdinal(d3.schemeCategory10);
    
        // Add the scatterplot
        svg.selectAll("dot")
            .data(__data)
            .enter().append("circle")
            .attr("r", 4)
            .attr("cx", function(d) { return x(d[x_var]); })
            .attr("cy", function(d) { return y(d[y_var]); })
            // .style("fill", function(d) { return color(d.year); })
            .style("opacity", 0.8);

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .style('font-family','"Lato",sans-serif')
            .call(d3.axisBottom(x).ticks(11,".0s"))
        
        // X axis label
        svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margins.bottom) + ")")
            .style("text-anchor", "middle")
            .attr("fill", "black")
            .text(x_var)
            .style('font-family','sans-serif')
            .style('font-size','14px')
            .style('font-weight','700')
            .attr('dy','-10');
        
        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));
            
        // Y axis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margins.left)
            .attr("x",0 - (height / 2))
            .style("text-anchor", "middle")
            .attr("fill", "black")
            .text(y_var)
            .style('font-family','sans-serif')
            .style('font-size','14px')
            .style('font-weight','700')
            .attr('dy','15');
            
     // //legend
     //    var legend = svg.selectAll('legend')
     //        .data(color.domain())
     //        .enter().append('g')
     //        .attr('class', 'legend')
     //        .attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });

     //    legend.append('rect')
     //        .attr('x', width - 45)
     //        .attr('width', 18)
     //        .attr('height', 18)
     //        .style('fill', color);

     //    legend.append('text')
     //        .attr('x', width)
     //        .attr('y', 9)
     //        .attr('dy', '.35em')
     //        .style('text-anchor', 'end')
     //        .style('font-family','sans-serif')
     //        .style('font-size','11px')
     //        .text(function(d){ return d; });

    // //title
    // svg.append("text")
    //         .attr("x", (width / 2))             
    //         .attr("y", 0 + (margins.top / 2))
    //         .attr("text-anchor", "middle")  
    //         .style("font-size", "16px") 
    //         .style("text-decoration", "underline")  
    //         .style('font-weight','700')
    //         .style('font-family','sans-serif')
    //         .text("GDP vs Life Expectancy (1952, 2007)");
    }
    
    this.draw(_data);
}