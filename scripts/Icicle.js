function Icicle(svg, _data = data, _hierTable = hierTable) {    
    var node = false;
    this.svg = svg;

    var margins = {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
    }

    //  grab the width and height of our containing SVG
    var width = svg.node().getBoundingClientRect().width - margins.right - margins.left;
    var height = svg.node().getBoundingClientRect().height - margins.top - margins.bottom;
    var boundingR = svg.node().getBoundingClientRect();
    
    var x = d3.scaleLinear()
        .range([0, width]);

    var y = d3.scaleLinear()
        .range([0, height]);

    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    var partition = d3.partition()
        .size([width, height])
        .padding(0)
        .round(true);


    var c = svg.append("g");

    // Add the bounding box
    c.append('rect')
        .attr('x',margins.left-5)
        .attr('y',margins.top-5)
        .attr('height',height+10)
        .attr('width',width+10)
        .attr('fill-opacity',0.01)
        .attr("stroke-width", 1)
        .attr('stroke', 'rgba(0, 0, 0, 0.05)')

    // var rect = svg.selectAll("rect");
    // var fo = svg.selectAll("foreignObject");

    function clicked(p) {
        x.domain([p.x0, p.x1]);
        y.domain([p.y0, height]).range([p.depth  ? 50 : 0, height]);

        svg.selectAll("rect").transition()
            .duration(750)
            .attr("x", function(d) { return x(d.x0); })
            .attr("y", function(d) { return y(d.y0); })
            .attr("width", function(d) { return x(d.x1) - x(d.x0); })
            .attr("height", function(d) { return y(d.y1) - y(d.y0); });
        
        svg.selectAll('foreignObject').transition()
            .duration(750)
            .attr("x", function(d) { return x(d.x0); })
            .attr("y", function(d) { return y(d.y0); })
            .attr("width", function(d) { return x(d.x1)-x(d.x0); })
            .attr("height", function(d) { return y(d.y1)-y(d.y0); })
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

        svg.selectAll('rect').remove();
        svg.selectAll('foreignObject').remove();

        svg.selectAll('rect')
          .data(root.descendants())
          .enter().append("rect")
          .attr("x", function(d) { return d.x0; })
          .attr("y", function(d) { return d.y0; })
          .attr('transform', 'translate(' + margins.left + ',' + margins.top  + ')')
          .attr("width", function(d) { return d.x1 - d.x0; })
          .attr("height", function(d) { return d.y1 - d.y0; })
          .attr("stroke-width", 1)
          .attr("stroke", '#FFFFFF')
          .attr("fill", function(d) { return color((d.children ? d : d.parent).data.id); })
          .style("cursor", "pointer")
          .on("click", clicked);

        svg.selectAll('foreignObject')
            .data(root.descendants())
            .enter().append("foreignObject")
            .attr("x", function(d) { return d.x0 + 2; })
            .attr("y", function(d) { return d.y0 + 2; })
            .attr('transform', 'translate(' + margins.left + ',' + margins.top  + ')')
            .attr("width", function(d) { return d.x1 - d.x0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .style("cursor", "pointer")
            .text(function(d) { return d.data.id;})
            .on("click", clicked);

        rect.exit().remove();
        fo.exit().remove();

    };
    
    this.draw(_data);

}