// Formatted display title for dimension
// "dim": "Full dimension title",
var _titles = {

};


// Formatted display title for catagories
// "categoryName": ["Group 1", "Group 2"],
var _categoryTitles = {

}

// Returns formatted titles for dimention
// If the values are catagorical then adding the value will return the value's title
function title(dimension, value = null) {
    if (value) {
        return (_categoryTitles[dimension] || {})[value] || value;
    }
    return _titles[dimension] || dimension;
}