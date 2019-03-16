function Sunburst(svg, _data = data, _hierTable = hierTable) {    
    this.svg = svg;

    var margins = {
        top: 25,
        bottom: 35,
        left: 10,
        right: 10
    }
    
    //  grab the width and height of our containing SVG
    var width = svg.node().getBoundingClientRect().width - margins.right - margins.left;
    var height = svg.node().getBoundingClientRect().height - margins.top - margins.bottom;
    var boundingR = svg.node().getBoundingClientRect();

    var radius = Math.min(width, height) / 2;  // < -- 2
    var color = d3.scaleOrdinal(d3.schemeCategory20b);   // <-- 3

    var c = svg.append("g");

    var g = svg
        .append('g') 
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')'); 

    var partition = d3.partition()  // <-- 1
        .size([2 * Math.PI, radius]);  // <-- 2

    c.append('rect')
        .attr('x',margins.left-5)
        .attr('y',margins.top-5)
        .attr('height',height+10)
        .attr('width',width+10)
        .attr('fill-opacity',0.01)
        .attr("stroke-width", 1)
        .attr('stroke', 'rgba(0, 0, 0, 0.05)')

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


        partition(root);

        var arc = d3.arc()  // <-- 2
          .startAngle(function (d) { return d.x0 })
          .endAngle(function (d) { return d.x1 })
          .innerRadius(function (d) { return d.y0 })
          .outerRadius(function (d) { return d.y1 });

        g.selectAll('path')
            .remove()

        g.selectAll('path')  
            .data(root.descendants())  
            .enter() 
            .append('path')  
            .attr("display", function (d) { return d.depth ? null : "none"; })  
            .attr("d", arc)  
            // .style('stroke', '#FFFFFF')  
            .style("fill", function (d) { return color(d.data.id); })
            .style("opacity",0.9)
            .on("mouseover",handleMouseOver)
        
        function handleMouseOver(d, index, nodes) {
                console.log(d.data.id);

        }

    };
    
    this.draw(_data);

}