var data;

// Set the key to group on
var groupKey = "";

var parallelC;

function filterChanged(key = null) {
    filter.mark();
    parallelC.draw();
}
var filter = new Filter(filterChanged);
var color = new Color(d3.schemeCategory10);

//Process the data
// d3.csv("./data/data.csv", function (error, rawData) {
//     data = rawData;
// 
//     parallelC = new ParallelCoordinates(d3.select(".parallelC"), []);
// });
