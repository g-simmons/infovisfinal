function Sunburst(svg, _data = data, _hierTable = hierTable) {    
    var node = false;
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

    // c.append('rect')
        // .attr('x',margins.left-5)
        // .attr('y',margins.top-5)
        // .attr('height',height+10)
        // .attr('width',width+10)
        // .attr('fill-opacity',0.01)
        // .attr("stroke-width", 1)
        // .attr('stroke', 'rgba(0, 0, 0, 0.05)')

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

        key = function key(d) {
            return d.data.id;
        }


        var arcs = g.selectAll('path').data(root.descendants(),key);

        arcs.transition().duration(20).attrTween("d", function (d, i) {
                return arcTweenPath(d, i);
            });

        arcs.enter() 
            .append('path')
            .attr("display", function (d) { return d.depth ? null : "none"; })
            .attr("d", arc)  
            .style("fill", function (d) { return color(d.data.id); })
            .style("opacity",0.9)
            .on('mouseover',function(d){
                d3.select('#tooltip')
                    .style('display','block')
                    .style("top", (d3.event.pageY)+"px")
                    .style("left", (d3.event.pageX)+"px");
                d3.select('#tooltip').select(".title").text(d.data.id);
                d3.select('#tooltip').select(".value").html('');
                console.log(d.data.id)
            })
            .on('mousemove',function(d){
                d3.select('#tooltip')
                    .style('display','block')
                    .style("top", (d3.event.pageY)+"px")
                    .style("left", (d3.event.pageX)+"px");
            })
            .on("mouseout",function(d,i,n){
                d3.select("#tooltip").style('display','none');
            });

        arcs.exit().remove();

        function arcTweenPath(a, i) {
            // (a.x0s ? a.x0s : 0) -- grab the prev saved x0 or set to 0 (for 1st time through)
            // avoids the stash() and allows the sunburst to grow into being
            var oi = d3.interpolate({ x0: (a.x0s ? a.x0s : 0), x1: (a.x1s ? a.x1s : 0), y0: (a.y0s ? a.y0s : 0), y1: (a.y1s ? a.y1s : 0) }, a);
            function tween(t) {
              var b = oi(t);
              a.x0s = b.x0;
              a.x1s = b.x1;
              a.y0s = b.y0;
              a.y1s = b.y1;
              return arc(b);
            }
            if (i == 0 && node) {  // If we are on the first arc, adjust the x domain to match the root node at the current zoom level.
              var xd = d3.interpolate(x.domain(), [node.x0, node.x1]);
              var yd = d3.interpolate(y.domain(), [node.y0, 1]);
              var yr = d3.interpolate(y.range(), [node.y0 ? 40 : 0, radius]);

              return function (t) {
                x.domain(xd(t));
                y.domain(yd(t)).range(yr(t));
                return tween(t);
              };
            } else {
              return tween;
            }
        }

    };
    
    this.draw(_data);

}