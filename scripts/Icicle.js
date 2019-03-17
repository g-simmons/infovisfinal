function Icicle(svg, _data = data, _hierTable = hierTable) {    
    console.log(svg);
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

    var color = d3.scaleOrdinal(d3.schemeCategory20);

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

    var rect = svg.selectAll("rect");
    var fo = svg.selectAll("foreignObject");

    function clicked(d) {
        x.domain([d.x0, d.x1]);
        y.domain([d.y0, height]).range([d.depth  ? 50 : 0, height]);

        rect.transition()
            .duration(750)
            .attr("x", function(d) { return x(d.x0); })
            .attr("y", function(d) { return y(d.y0); })
            .attr("width", function(d) { return x(d.x1) - x(d.x0); })
            .attr("height", function(d) { return y(d.y1) - y(d.y0); });
        
        fo.transition()
            .duration(750)
            .attr("x", function(d) { return x(d.x0); })
            .attr("y", function(d) { return y(d.y0); })
            .attr("width", function(d) { return x(d.x1-d.x0); })
            .attr("height", function(d) { return y(d.y1-d.y0); });
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
            .sum(function (d) { return d.data.amt});
            // .sort(function(a, b) { return b.data.amt - a.data.amt; }); 

        partition(root);

        key = function key(d) {
            return d.data.id;
        }

        console.log(root.descendants());

        rect = rect
          .data(root.descendants())
          .enter().append("rect")
          .attr("x", function(d) { return d.x0 + 1; })
          .attr("y", function(d) { return d.y0 + 1; })
          .attr('transform', 'translate(' + margins.left + ',' + margins.top  + ')')
          .attr("width", function(d) { return d.x1 - d.x0; })
          .attr("height", function(d) { return d.y1 - d.y0; })
          .attr("stroke-width", 1)
          .attr("stroke", '#FFFFFF')
          .attr("fill", function(d) { return color((d.children ? d : d.parent).data.id); })
          // .attr("fill", "#CCCCCC")
          .style("cursor", "pointer")
          // .on('mouseover',function(d){console.log(d.data.id)})
          .on("click", clicked);

        fo = fo
        .data(root.descendants())
        .enter().append("foreignObject")
          .attr("x", function(d) { return d.x0; })
          .attr("y", function(d) { return d.y0; })
          .attr('transform', 'translate(' + margins.left + ',' + margins.top  + ')')
          .attr("width", function(d) { return d.x1 - d.x0; })
          .attr("height", function(d) { return d.y1 - d.y0; })
         .style("cursor", "pointer")
         .text(function(d) { console.log(d); return d.data.id;})
         .on("click", clicked);

    };
    
    this.draw(_data);

}