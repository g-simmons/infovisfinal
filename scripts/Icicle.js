// Inspiration/Code Snippets from:
//     - "Zoomable Icicle" M. Bostock. https://observablehq.com/@d3/zoomable-icicle
//     - "Zoomable Icicle with Labels and Breadcrumb (d3v4)" L. Chauvirey. https://bl.ocks.org/lorenzopub/c4a226f9c29a20dd0cc152e212a70c9a


function Icicle(svg, _data = data, _hierTable = hierTable) {    
    this.svg = svg;

    var margins = {
        top: 30,
        bottom: 20,
        left: 10,
        right: 10
    }

    var label_pad = 4;

    //  grab the width and height of our containing SVG
    var width = svg.node().getBoundingClientRect().width - margins.right - margins.left;
    var height = svg.node().getBoundingClientRect().height - margins.top - margins.bottom;
    
    var x = d3.scaleLinear()
        .range([30, width - 60]);

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
        .attr('x', margins.left)
        .attr('y', margins.top)
        .attr('height', height)
        .attr('width', width)
        .append('g');
    
    var oldP;
    function clicked(p) {        
        if (oldP == p || p.depth == 0) {
            // go back home
            x.domain([30, width - 60]);
            y.domain([0, height]).range([0, height]);
            oldP = null;
        } else {
            x.domain([p.x0, p.x1]);
            y.domain([p.y0, height]).range([p.depth ? 45 : 0, height]);
            oldP = p;
        }

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
            .attr("y", d => y(d.y0) + label_pad * 2)
            .attr("width", d => x(d.x1)-x(d.x0) - label_pad*2)
            .attr("height", d => y(d.y1) - y(d.y0) - label_pad * 3 - 14);

        boxes.select('.icicle_number')
            .attr("x", d => x(d.x0) + label_pad)
            .attr("y", d => y(d.y1) - 14)
            .attr("width", d => x(d.x1)-x(d.x0) - label_pad*2)
            .attr("height", 14);
    }

    var strat = d3.stratify()
        .id(d => d.name)
        .parentId(d => d.parent)
        (_hierTable);
    var hierarchy = d3.hierarchy(strat);
    
    this.draw = function(__data = _data) {

        filteredData = filter.filtered(__data);

        // loop through compound in the hierTable
        // Only include subklass (leaf) values when constructing the data table in preprocessing!
        _hierTable.forEach(d => d.amt = d3.sum(filteredData, p => p[d.name]));

        var root = hierarchy.sum(d => d.data.amt)
            .sort((a, b) => b.height - a.height || b.value - a.value); 

        partition(root);

        var total_amt = root.value;
        
        var descendants = root.descendants().map(d => {   
            //Get the id of the top element
            var top = d;
            while (top.depth > 1) top = top.parent
            
            return {
                id: d.data.id,
                parent: top.data.id,
                depth: d.depth,
                x0: d.x0,
                x1: d.x1,
                y0: d.y0,
                y1: d.y1,
                percentage: Math.round(d.value / total_amt * 100 * 100) / 100
            }
        })

        var boxes = boxContainer.selectAll(".box")
            .data(descendants, d => d.id);

        function update(selection) {
            selection.select("rect")
                .attr("x", d => d.x0)
                .attr("y", d => d.y0)
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr('fill-opacity', 0.75)
                .attr("stroke-width", 1.5)
                .attr("stroke", "rgb(247,247,247)");

            selection.select(".icicle_label")
                .attr("x", d => d.x0 + label_pad)
                .attr("y", d => d.y0 + label_pad * 2)
                .attr("width", d => d.x1 - d.x0 - label_pad * 2)
                .attr("height", d => (d.y1 - d.y0) - label_pad * 3 - 14)
                .text(d => d.id);

            selection.select(".icicle_number")
                .attr("x", d => d.x0 + label_pad)
                .attr("y", d => d.y1 - 14)
                .attr("width", d => d.x1 - d.x0 - label_pad * 2)
                .attr("height", 14)
                .text(d => d.percentage.toFixed(2) + '%');
        }

        var boxesEnter = boxes.enter()
            .append("g")
            .attr("class", "box")
            .style("cursor", "pointer")
            .on("click", clicked);
        
        //Add box
        boxesEnter.append("rect")
            .attr("fill", function (d) {                
                if (!d.depth) return "#DDDDDD";
                return colorIcicle.forData(d);
            });

        //Add label
        boxesEnter.append("foreignObject")
            .attr('class', 'icicle_label');

        boxesEnter.append("foreignObject")
            .attr('class','icicle_number');

        update(boxesEnter);
        update(boxes.transition().duration(750));
        boxes.exit().remove();
    };
    
    this.draw(_data);

}