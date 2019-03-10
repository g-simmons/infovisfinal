var data;

// Set the key to group on
var groupKey = "";

var parallelC;
var scatterplot;

function filterChanged(key = null) {
    filter.mark();
    parallelC.draw();
}
var filter = new Filter(filterChanged);
var color = new Color(d3.schemeCategory10);

// Process the data
d3.csv("./data/foods_final.csv", function (error, rawData) {

    data = rawData;

    data.forEach(function(d) {
        d.ax1 = +d.ax1;
        d.ax2 = +d.ax2;
    });

    parallelC = new ParallelCoordinates(d3.select(".parallelC"), ['CARBOHYDRATES','FAT','PROTEIN']);
    scatterplot = new ScatterPlot(d3.select(".scatterplot"));
});
