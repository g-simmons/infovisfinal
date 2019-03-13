function ScatterPlot(svg, _data = data) {    
    this.svg = svg;
    var mouseStatus = {};

    var margins = {
        top: 40,
        bottom: 60,
        left: 240,
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
 
    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
	
	var point_displaying = null;

    // // X axis label
    // svg.append("text")
    //     .attr("transform", "translate(" + (width / 2) + " ," + (height + margins.bottom + margins.top) + ")")
    //     .style("text-anchor", "middle")
    //     .attr("fill", "black")
    //     .text(x_var)
    //     .style('font-family','sans-serif')
    //     .style('font-size','14px')
    //     .style('font-weight','700')
    //     .attr('dy','-10');

    // // Y axis label
    // svg.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", margins.left - 45 )
    //     .attr("x",0 - (height / 2))
    //     .style("text-anchor", "middle")
    //     .attr("fill", "black")
    //     .text(y_var)
    //     .style('font-family','sans-serif')
    //     .style('font-size','14px')
    //     .style('font-weight','700')
    //     .attr('dy','15');

    //title
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 + (margins.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .style('font-weight', '700')
        .style('font-family', 'sans-serif')
        .text("T-SNE");

    var xAxis = svg.append("g")
        .attr("transform", "translate(" + margins.left + "," + (height + margins.top) + ")")
        .style('font-family', '"Lato",sans-serif');
    var yAxis = svg.append("g")
        .attr("transform", "translate(" + margins.left + "," + margins.top + ")");
    
    var c = svg.append("g");

    var lasso = d3.lasso()
        .closePathSelect(true)
        .closePathDistance(100)
        .items(svg.selectAll("circle"))
        .targetArea(svg)
        .on("start", function () {            
            if (shiftKeyPressed) {
                mouseStatus.editing = filter.add("food_name", false);
            } else {
                filter.clear("food_name");
            }
        })
        .on("draw", function () {
            lasso.items().attr("r", 4);
            lasso.possibleItems().attr("r", 6);
        })
        .on("end", function () {
            lasso.items().attr("r", 4);
            filter.set("food_name", lasso.selectedItems().data().map(d => d.food_name), false, mouseStatus.editing);
        });

    svg.call(lasso);

    this.draw = function (__data = _data, x_var = 'ax1', y_var = 'ax2') {
        // Scale the range of the data
        x.domain(d3.range(x_var));
        y.domain(d3.range(y_var));
        
        // Add the scatterplot
        var circles = c.selectAll("circle").data(__data, d => d ? d.food_name : null);
        
        function update(selection) {
            selection.attr("cx", d => margins.left + x(d[x_var]))
                .attr("cy", d => margins.top + y(d[y_var]))
                .style("fill", d => d.filtered ? (d.filtered == "range" ? "rgb(240, 240, 240)" : "rgb(210, 210, 210)"): color.forData(d))
        }

        update(circles.enter().append("circle")
			.on("click",function(d,n,i){
				
				if(point_displaying) {point_displaying.attr("stroke-width", 0)}
				point_displaying = d3.select(this).attr("stroke-width", 2)
				var url = "http://en.wikipedia.org/wiki/" + d.wikipedia_id
				var txt = ""
				txt += '<h3>'+d.food_name+'</h3>'
				txt += "<h5>("+d.name_scientific+")</h5>"
				txt += "<p>"+d.description+"</p>"
				txt += "<p>"+'<a href ="'+url+'">'+url+'</a>'+"</p>"
				d3.select("#writeup")
					.html(txt)
			})
            .attr("r", 4)
			.attr("stroke", "#000000")
			.attr("stroke-width", 0)
            .style("opacity", 0.8));
        update(circles)
        circles.exit().remove();

        // // Add the X Axis
        xAxis.call(d3.axisBottom(x).ticks(11, ".0s"))

        // // Add the Y Axis
        yAxis.call(d3.axisLeft(y));
            
        //legend
        var legend = svg.selectAll('.legend')
            .data(color.domain());

        function legendUpdate(selection) {
            selection.attr('class', 'legend')
                .attr('width', 100)
                .attr('transform', function (_, i) {
                    return 'translate(0,' + i * (legend_dims.rect_size + legend_dims.rect_pad) + ')';
                });
            selection.select("rect").style('fill', key => color.forValue(key));
            selection.select("text").text(d => title(color.key, d))
        }
        var legendEnter = legend.enter().append('g');
        legendEnter.append('rect')
            .attr('x', legend_dims.left)
            .attr('width', legend_dims.rect_size)
            .attr('height', legend_dims.rect_size)
        legendEnter.append('text')
            .attr('x', 50)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'start')
            .style('font-family', 'sans-serif')
            .style('font-size', '11px');

        legendUpdate(legendEnter);
        legendUpdate(legend.transition());
        legend.exit().remove();

        c.selectAll("circle").sort((a, b) => (a.filtered == false) > (b.filtered == false));

    }
    
    this.draw(_data);

    //Set lasso items
    lasso.items(c.selectAll("circle"));
}