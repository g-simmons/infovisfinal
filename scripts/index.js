var data;

// Set the key to group on
var groupKey = "";

var parallelC;
//The dimentions that would be shown on the parallel coordinates
var parallelCDimentions = [
    "Carbohydrates",
    "Fat",
    "Protein"
]
var scatterplot;
var legend;

d3.select("#clearFilters").on("click", function () {
    filter.clear();
});

function filterChanged(key = null) {
    if (filter.isEmpty()) {
        d3.select("#clearFilters").attr("disabled", "true");
    } else {
        d3.select("#clearFilters").attr("disabled", null);
    }
    filter.mark();
    color.colorBy(color.key, false);
    parallelC.draw();
    scatterplot.draw();
    legend.draw();
    console.log("in");
    
}
var filter = new Filter(filterChanged);

var numcolors;
var colorscheme;

function colorChanged() {
    parallelC.draw();
    scatterplot.draw();
    legend.draw();
}

var color;

// Process the data
d3.csv("./data/foods_final.csv", function (error, rawData) {

    data = rawData;

    data.forEach(function(d) {
        
        d3.keys(d).forEach(key => {
            //TODO: Manually convert for accuracy!
            //Source: stackoverflow.com/questions/175739/
            d[key] = (isNaN(+d[key]) ? d[key] : Number(d[key]));
        });

        d.ax1 = +d.ax1;
        d.ax2 = +d.ax2;
    });
    filter.mark();
	color = new Color(null, "food_group", colorChanged);

    parallelC = new ParallelCoordinates(d3.select(".parallelC"), parallelCDimentions);
    scatterplot = new ScatterPlot(d3.select(".scatterplot"));
    legend = new Legend(d3.select(".legend"));
	show_instructions();
});
