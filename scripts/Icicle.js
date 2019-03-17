function Icicle(svg, _data = data, _hierTable = hierTable) {    
    var node = false;
    this.svg = svg;

    var margins = {
        top: 20,
        bottom: 10,
        left: 10,
        right: 10
    }

    var label_pad = 4;

    //  grab the width and height of our containing SVG
    var width = svg.node().getBoundingClientRect().width - margins.right - margins.left;
    var height = svg.node().getBoundingClientRect().height - margins.top - margins.bottom;
    var boundingR = svg.node().getBoundingClientRect();
    
    var x = d3.scaleLinear()
        .range([0, width]);

    var y = d3.scaleLinear()
        .range([0, height]);

    var partition = d3.partition()
        .size([width, height])
        .padding(0)
        .round(true);

    var c = svg.append("g");

    var g = svg.append('svg')
        .attr('x',0)
        .attr('y',10)
        .append('g')
        .attr('transform', 'translate(' + 10 + ',' + 10 + ')');

    // Add the bounding box
    c.append('rect')
        .attr('x',margins.left-5)
        .attr('y',margins.top-5)
        .attr('height',height+10)
        .attr('width',width+10)
        .attr('fill-opacity',0.01)
        .attr("stroke-width", 1)
        .attr('stroke', 'rgba(0, 0, 0, 0.05)')

    svg.append("text")
        .attr("x", 5)
        .attr("y", 0 + (margins.top /2))
        .attr("text-anchor", "start")
        .style("font-size", "13px")
        .style('font-weight', '700')
        .style('font-family', 'sans-serif')
        .text("Chemical Composition");

    function clicked(p) {
        x.domain([p.x0, p.x1]);
        y.domain([p.y0, height]).range([p.depth ? 45 : 0, height]);

        g.selectAll("rect").transition()
            .duration(750)
            .attr("x", function(d) { return x(d.x0); })
            .attr("y", function(d) { return y(d.y0); })
            .attr("width", function(d) { return x(d.x1) - x(d.x0); })
            .attr("height", function(d) { return y(d.y1) - y(d.y0); });
        
        g.selectAll('foreignObject').transition()
            .duration(750)
            .attr("x", function(d) { return x(d.x0) + label_pad; })
            .attr("y", function(d) { return y(d.y0) + label_pad; })
            .attr("width", function(d) { return x(d.x1)-x(d.x0) - label_pad*2; })
            .attr("height", function(d) { return y(d.y1)-y(d.y0) - label_pad*2; })
            .style("cursor", "pointer")
            .text(function(d) { return d.data.id;})
            .on("click", clicked);
    }

    this.draw = function(__data = _data, __hierTable = _hierTable) {

        selection = __data.filter(function(d){return !d.filtered});

        // loop through compound in the hierTable
        // Only include subklass (leaf) values when constructing the data table in preprocessing!
        hierTable.forEach(
            function(d,i) { 
                d.amt = d3.sum(selection, function(p){return parseFloat(p[d.name]);})
            })

        strat = d3.stratify()
            .id(function(d) { return d.name; })
            .parentId(function(d) { return d.parent; })
            (hierTable);

        var root = d3.hierarchy(strat)
            .sum(function (d) { return d.data.amt})
            .sort((a, b) => b.height - a.height || b.value - a.value); 

        partition(root);

        g.selectAll('rect').remove();
        g.selectAll('foreignObject').remove();

        g.selectAll('rect')
            .data(root.descendants())
            .enter().append("rect")
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("width", function(d) { return d.x1 - d.x0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("stroke-width", 1)
            .attr("stroke", '#FFFFFF')
            .attr("fill", function(d) {if (!d.depth) return "#DDDDDD"; while (d.depth > 1) d = d.parent; return colorIcicle.forData(d.data);})
            .style("cursor", "pointer")
            .on("click", clicked);

        g.selectAll('foreignObject')
            .data(root.descendants())
            .enter().append("foreignObject")
            .attr("x", function(d) { return d.x0 + label_pad; })
            .attr("y", function(d) { return d.y0 + label_pad; })
            .attr("width", function(d) { return d.x1 - d.x0 - label_pad*2; })
            .attr("height", function(d) { return d.y1 - d.y0 - label_pad*2; })
            .style("cursor", "pointer")
            .attr('class','icicle_label')
            .text(function(d) { return d.data.id;})
            .on("click", clicked);

    };
    
    this.draw(_data);

}