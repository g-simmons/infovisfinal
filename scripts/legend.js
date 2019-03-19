function Legend(svg, _data = data) {
    this.svg = svg;

    var margins = {
        top: 0,
        bottom: 60,
        left: 0,
        right: 20
    }

    var legend_dims = {
        left: 8,
        rect_size: 18,
        rect_pad: 2
    }

    this.draw = function (__data = _data) {
        //legend
        var legend = svg.selectAll('.legend')
            .data(color.domain(), d => d);

        function legendUpdate(selection) {
            selection.attr('class', 'legend')
                .attr('width', 100)
                .attr('transform', function (_, i) {
                    return 'translate(0,' + (i * (legend_dims.rect_size + legend_dims.rect_pad) + margins.top) + ')';
                });
            selection.select("rect").style('fill', key => color.forValue(key)).attr("opacity", d =>
                filter.isFilteredKV(color.key, d) != false ? 0.25 : 1
            );
            selection.select("text").text(d => title(color.key, d)).attr("opacity", d =>                
                filter.isFilteredKV(color.key, d) != false ? 0.25 : 1
            );
        }
        var legendEnter = legend.enter().append('g');
        legendEnter.append('rect')
            .attr('x', legend_dims.left)
            .attr('width', legend_dims.rect_size)
            .attr('height', legend_dims.rect_size)
            .on('click', function (d, i, n) {
                displaypalette(d, i, d3.select(".palette"), 0)
            })
        legendEnter.append('text')
            .attr('x', 38)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'start')
            .style('font-family', 'sans-serif')
            .style('font-size', '11px')
            .on("click", function() {
                var f = filter.get(color.key)[0] || [];
                var val = d3.select(this).data()[0];
                if (f.includes(val)) {
                    f = f.filter(d => d != val);
                } else {
                    f.push(val);
                }
                filter.set(color.key, f, false);
            });

        legendUpdate(legendEnter);
        legendUpdate(legend);
        legend.exit().remove();

    }

    this.draw(_data);
}