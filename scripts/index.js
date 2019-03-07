function filterChanged(key = null) {

}

var data;
var filter = new Filter(filterChanged);
var color = new Color(d3.schemeCategory10);

// Set the key to group on
var groupKey = "";

var parallelC;


//Process the data
// d3.csv("data/", function (error, rawData) {

//     parallelC = new ParallelCoordinates(d3.select(".parallelC"));
// });
