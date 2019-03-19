// Inspiration/Code Snippets from:
//     - "d3.lasso example - scatterplot" S. Kokenes. https://bl.ocks.org/skokenes/a85800be6d89c76c1ca98493ae777572

function format_nutrient_val(val) {
    // convert from milligrams
    val = val / 1e3

    //append 'g/100g'
    return(val.toFixed(2) + ' g/100g')
}

function ScatterPlot(svg, _data = data) {    
    this.svg = svg;
    var mouseStatus = {};

    var margins = {
        top: 25,
        bottom: 15,
        left: 10,
        right: 10
    }
    
    //  grab the width and height of our containing SVG
    var width = svg.node().getBoundingClientRect().width - margins.right - margins.left;
    var height = svg.node().getBoundingClientRect().height - margins.top - margins.bottom;
    var boundingR = svg.node().getBoundingClientRect();
    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    //title
    svg.append("text")
        .attr("x", 5)
        .attr("y", 0 + (margins.top / 2))
        .attr("text-anchor", "start")
        .style("font-size", "13px")
        .style('font-weight', '700')
        .style('font-family', 'sans-serif')
        .text("Food Clustering (T-SNE)");
    
    var c = svg.append("g");
	// Add the bounding box
	var boundBox = c.append('rect')
	    .attr('x', margins.left - 5)
	    .attr('y', margins.top - 5)
	    .attr('height', height + 10)
	    .attr('width', width + 10)
	    .attr('fill-opacity', 0.01)
	    .attr("stroke-width", 1)
	    .attr('stroke', 'rgba(0, 0, 0, 0.05)')

    var lasso = d3.lasso()
        .closePathSelect(true)
        .closePathDistance(100)
        .items(svg.selectAll("circle"))
        .targetArea(boundBox)
        .on("draw", function () {
            lasso.items().attr("r", 4);
            lasso.possibleItems().attr("r", 6);
        })
        .on("end", function () {
            lasso.items().attr("r", 4);
            if (shiftKeyPressed) {
                mouseStatus.editing = filter.add("food_name", false);
            }
            
            if (lasso.selectedItems().data().length == 0) {
                //Don't reset the filter if the user intends to select a point
                setTimeout(function () {
                    if (d3.select("#infoC").attr("class") != null) {
                        filter.clear("food_name");
                        filter.clear("Selection");
                    }
                }, 100);
            } else {
                filter.set("food_name", lasso.selectedItems().data().map(d => d.food_name), false, mouseStatus.editing);
            }
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
			.on("click",function(d,i,n){
                if (d.filtered) {
                    return;
                }
				var url = "http://en.wikipedia.org/wiki/" + d.wikipedia_id
				var txt = ""

                txt += '<h3>' + d.food_name + " - " + d.name_scientific + "" + '</h3>'
                txt += '<p><b>CARBOHYDRATES</b> <span>' + format_nutrient_val(d.Carbohydrates) + '</span></p>'
                txt += '<p><b>FAT</b> <span>' + format_nutrient_val(d.Fat) + '</span></p>'
                txt += '<p><b>PROTEIN</b> <span>' + format_nutrient_val(d.Protein) + '</span></p>'
                txt += "<p>"+d.description+"</p>"

				txt += "<p>"+'<a href ="'+url+'" target="_blank">'+url+'</a>'+"</p>"
				d3.select("#info").select(".data")
                    .html(txt);
                d3.select("#infoC").attr("class", null);
			})
			.on("mouseover",function(d,i,n){
                if (d.filtered) {
                    return;
                }

				d3.select('#tooltip')
					.style('display','block')
					.style('left', (boundingR.x + margins.left + x(d[x_var])) + 'px')
                    .style('top', (boundingR.y + margins.top + y(d[y_var]) - 10) + 'px');
                d3.select('#tooltip').select(".title").text(d.food_name);

			})
			.on("mouseout",function(d,i,n){
				d3.select("#tooltip").style('display','none');
			})
            .attr("r", 4)
			.attr("stroke", "#000000")
			.attr("stroke-width", 0)
            .style("opacity", 0.8));
        update(circles)
        circles.exit().remove();

        //Move filtered items back
        c.selectAll("circle").sort((a, b) => (a.filtered == false) > (b.filtered == false));
    }
    
    this.draw(_data);

    //Set lasso items
    lasso.items(c.selectAll("circle"));
}