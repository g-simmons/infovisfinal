function ParallelCoordinates(svg, dimensions, _data = data) {
    this.svg = svg;
    var margins = {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
    }
    //  grab the width and height of our containing SVG
    var width = svg.node().getBoundingClientRect().width - margins.right - margins.left;
    var height = svg.node().getBoundingClientRect().height - margins.top - margins.bottom;

    this.draw = function(data = data) {
        
    }
    
    this.draw(_data);
}