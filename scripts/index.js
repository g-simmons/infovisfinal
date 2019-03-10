var data;

// Set the key to group on
var groupKey = "";

var parallelC;
//The dimentions that would be shown on the parallel coordinates
var parallelCDimentions = [
    "Organoheterocyclic compounds",
    "Organooxygen compounds"
]

function filterChanged(key = null) {
    filter.mark();
    parallelC.draw();
}
var filter = new Filter(filterChanged);
var color = new Color(d3.schemeCategory10);

// Process the data
d3.csv("./data/foods_final.csv", function (error, rawData) {

    data = rawData.map(d => {        
        d3.keys(d).forEach(key => {
            //TODO: Manually convert for accuracy!
            //Source: stackoverflow.com/questions/175739/
            d[key] = (isNaN(+d[key]) ? d[key] : Number(d[key]));
        });
        return d;
    });
    console.log(data);

    parallelC = new ParallelCoordinates(d3.select(".parallelC"), parallelCDimentions);
});
