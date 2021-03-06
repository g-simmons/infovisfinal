var data;
var klassinfo;
var hierTable;
var pause_icicle_update = false;

// Set the key to group on
var groupKey = "";

var parallelC;
//The dimentions that would be shown on the parallel coordinates
var parallelCDimentions = [
    "Carbohydrates",
    "Fat",
    "Protein",
    "Fiber"
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
    if (!pause_icicle_update) {
        icicle.draw();
    }
    legend.draw();    
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

d3.csv("./data/klassinfo.csv", function (error, rawData) {
    hierTable = rawData;
});

// Process the data
d3.csv("./data/foods_final.csv", function (error, rawData) {

    data = rawData;

    data.forEach(function(d) {
        d3.keys(d).forEach(key => {
            //Source: stackoverflow.com/questions/175739/
            d[key] = (isNaN(+d[key]) ? d[key] : Number(d[key]));
        });
    });

    filter.mark();
    color = new Color(null, "food_group", colorChanged);

    //Setup Color picker
    d3.select("#colorSelector").on("change", function () {
            var key = d3.select(this).node().value;
            color.colorBy(key);
    }).selectAll("option")
        .data(colorKeys)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => title(d));

	colorIcicle = new Color(null, "parent");

    parallelC = new ParallelCoordinates(d3.select(".parallelC"), parallelCDimentions);
    scatterplot = new ScatterPlot(d3.select(".scatterplot"));
    icicle = new Icicle(d3.select(".icicle"));
    legend = new Legend(d3.select(".legend"));
});

d3.select("#infoC").on("click", function() {    
    if (d3.event.target.id != "infoC" && d3.event.target.className != "x") {
        return;
    }
    d3.select("#infoC").classed("closed", true);
})