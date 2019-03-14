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

function filterChanged(key = null) {
    filter.mark();
    parallelC.draw();
    scatterplot.draw();
}
var filter = new Filter(filterChanged);

var numcolors;
var colorscheme;
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

    numcolors = d3.map(data, function(d){return d.food_group;}).keys().length
	colorscheme = new Array(numcolors);
	for (i=0 ; i<numcolors ; i++) {
		colorscheme[i] = d3.interpolateRainbow(i/numcolors);
	}
	color = new Color(colorscheme);

    parallelC = new ParallelCoordinates(d3.select(".parallelC"), parallelCDimentions);
    scatterplot = new ScatterPlot(d3.select(".scatterplot"));
	show_instructions();
});
