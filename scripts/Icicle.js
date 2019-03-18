// Inspiration/Code Snippets from:
//     - "Zoomable Icicle" M. Bostock. https://observablehq.com/@d3/zoomable-icicle
//     - "Zoomable Icicle with Labels and Breadcrumb (d3v4)" L. Chauvirey. https://bl.ocks.org/lorenzopub/c4a226f9c29a20dd0cc152e212a70c9a


function Icicle(svg, _data = data, _hierTable = hierTable) {    
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
    
    var x = d3.scaleLinear()
        .range([0, width]);

    var y = d3.scaleLinear()
        .range([0, height]);

    var partition = d3.partition()
        .size([width, height])
        .padding(0)
        .round(true);

    // Add the bounding box
    svg.append('rect')
        .attr('x', margins.left - 5)
        .attr('y', margins.top - 5)
        .attr('height', height + 10)
        .attr('width', width + 10)
        .attr('fill-opacity', 0.01)
        .attr("stroke-width", 1)
        .attr('stroke', 'rgba(0, 0, 0, 0.05)')
    
    // Add title
    svg.append("text")
        .attr("x", 5)
        .attr("y", 0 + (margins.top / 2))
        .attr("text-anchor", "start")
        .style("font-size", "13px")
        .style('font-weight', '700')
        .style('font-family', 'sans-serif')
        .text("Chemical Composition");

    var boxContainer = svg.append('svg')
        .attr('x',0)
        .attr('y',10)
        .append('g')
        .attr('transform', 'translate(' + 10 + ',' + 10 + ')');

    function clicked(p) {
        x.domain([p.x0, p.x1]);
        y.domain([p.y0, height]).range([p.depth ? 45 : 0, height]);
        
        var boxes = boxContainer
            .selectAll(".box")
            .transition()
            .duration(750);

        boxes.select("rect")
            .attr("x", d => x(d.x0))
            .attr("y", d => y(d.y0))
            .attr("width", d => x(d.x1) - x(d.x0))
            .attr("height", d => y(d.y1) - y(d.y0));
        
        boxes.select('.icicle_label')
            .attr("x", d => x(d.x0) + label_pad)
            .attr("y", d => y(d.y0) + label_pad)
            .attr("width", d => x(d.x1)-x(d.x0) - label_pad*2)
            .attr("height", d => y(d.y1)-y(d.y0) - label_pad*2 - 20)
            .text(d => d.data.id);

        boxes.select('.icicle_number')
            .attr("x", d => x(d.x0) + label_pad)
            .attr("y", d => y(d.y1) - (label_pad*2 + 10))
            .attr("width", d => x(d.x1)-x(d.x0) - label_pad*2)
            .attr("height", d => y(d.y1)-y(d.y0) - label_pad*2);

        //Disable cursor on non clickable element
        boxes.style("cursor", "pointer");
        d3.select(this).style("cursor", "default");
    }

    this.draw = function(__data = _data, __hierTable = _hierTable) {

        filteredData = filter.filtered(__data);

        // loop through compound in the hierTable
        // Only include subklass (leaf) values when constructing the data table in preprocessing!
        __hierTable.forEach(
            function(d) { 
                d.amt = d3.sum(filteredData, p => parseFloat(p[d.name]))
            });

        strat = d3.stratify()
            .id(function(d) { return d.name; })
            .parentId(function(d) { return d.parent; })
            (__hierTable);

        var root = d3.hierarchy(strat)
            .sum(function (d) { return d.data.amt})
            .sort((a, b) => b.height - a.height || b.value - a.value); 

        partition(root);

        var total_amt = root.value;
        
        var boxes = boxContainer.selectAll(".box")
            .data(root.descendants(), d => d.data.id);

        function update(selection) {
            selection.select(".icicle_label")
                .text(d => d.data.id);
            selection.select(".icicle_number")
                .text(d => (d.value / total_amt * 100).toFixed(2) + '%');
        }

        var boxesEnter = boxes.enter()
            .append("g")
            .attr("class", "box")
            .style("cursor", "pointer")
            .on("click", clicked);
        
        //Add box
        boxesEnter.append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("stroke-width", 1)
            .attr("stroke", '#FFFFFF')
            .attr("fill", function (d) {
                if (!d.depth) return "#DDDDDD";
                while (d.depth > 1) d = d.parent;
                    return colorIcicle.forData(d.data);
            });

        //Add label
        boxesEnter.append("foreignObject")
            .attr("x", d => d.x0 + label_pad)
            .attr("y", d => d.y0 + label_pad)
            .attr("width", d => d.x1 - d.x0 - label_pad * 2)
            .attr("height", d => d.y1 - d.y0 - label_pad * 2 - 20)
            .attr('class', 'icicle_label');

        boxesEnter.append("foreignObject")
            .attr("x", d => d.x0 + label_pad)
            .attr("y", d => d.y1 - (label_pad*2 + 10))
            .attr("width", d => d.x1 - d.x0 - label_pad*2)
            .attr("height", d => d.y1 - d.y0 - label_pad*2)
            .attr('class','icicle_number')

        update(boxesEnter);
        update(boxes);
        boxes.exit().remove();
    };
    
    this.draw(_data, _hierTable);

}