function Legend(svg, _data = data) {
    this.svg = svg;

    var margins = {
        top: 20,
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
            selection.select("rect").style('fill', key => color.forValue(key));
            selection.select("text").text(d => title(color.key, d))
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
            .attr('x', 50)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'start')
            .style('font-family', 'sans-serif')
            .style('font-size', '11px');

        legendUpdate(legendEnter);
        legendUpdate(legend.transition());
        legend.exit().remove();

    }

    this.draw(_data);
}