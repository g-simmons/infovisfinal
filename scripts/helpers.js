function Filter(didUpdateCallback = null) {
    var _filters = {};

    function RangeFilter(range) {
        this.values;
        this.isFiltered = function (value) {
            return !this.isEmpty() && (value < this.values[0] || value > this.values[1])
        }
        this.set = function(range) {
            this.values = d3.extent(range);
        }
        this.isEmpty = function() {
            return this.values.includes(undefined);
        }
        this.set(range);
    }

    function CollectionFilter(values) {
        this.values;
        this.isFiltered = function (value) {
            return !this.isEmpty() && this.values.includes(value);
        }
        this.set = function (values) {
            this.values = values;
        }
        this.isEmpty = function () {
            return this.values.length == 0;
        }
        this.set(values);
    }

    function filterSelector(values, isRange = true) {
        return isRange ? new RangeFilter(values) : new CollectionFilter(values);
    }

    // Key is optional
    // If Key == null will clear all filters
    this.clear = function(key, idx = null) {        
        if (key) {
            if (idx) {
                // Remove filter at idx
                _filters[key].splice(idx, 1);
            } else {
                delete _filters[key];
            }
        } else {
            // Clear all filters
            _filters = {};
        }
        if (didUpdateCallback) {
            didUpdateCallback(key);
        }
    }

    // Add a new filter for the key
    this.add = function(key, isRange = true) {
        if (!_filters[key]) {
            _filters[key] = [filterSelector([], isRange)];
        } else if (!_filters[key][_filters[key].length - 1].isEmpty()) {
            _filters[key].push(filterSelector([], isRange));
        }

        return _filters[key].length - 1;
    }

    // Set the value of the filter, defaults to the top filter.
    // Range is an array:
    // If isRange == true: [minVal, maxVal]
    // else [val1, val2, val3, ...]
    this.set = function (key, values, isRange = true, idx = null) {
        if (idx == null || !_filters[key]) {
            this.clear(key);
            idx = -1;
        }
        // Add a filter if one does not exist
        if (idx < 0) {
            this.add(key, isRange);
            idx = 0;            
        }

        _filters[key][idx].set(values);
        
        if (didUpdateCallback) {
            didUpdateCallback(key);
        }        
    }

    // Returns true if the value is filtered on the key
    this.isFilteredKV = function(key, value) {
        var filtered = [];
        var length = 0;
        var isRange = false;
        for (var i in _filters[key]) {
            var filter = _filters[key][i];
            
            if (filter && !filter.isEmpty()) {
                if (filter.isFiltered(value)) {
                    filtered.push(i);
                }
                length++;
            }

            if (filter instanceof RangeFilter) {
                isRange = true;
            }
        }
        if (isRange) {
            return filtered.length == length ? "range" : false;
        }

        return (filtered.length == 0 && length > 0) ? "collection" : false;
    }

    // Returns true if the data point is filtered for any of it's keys
    this.isFiltered = function(dataPoint) {
        var keys = d3.keys(_filters);
        keys = keys.sort((a, b) => _filters[b][0] instanceof RangeFilter);
                
        for (var i in keys) {
            var key = keys[i];            
            var filtered = this.isFilteredKV(key, dataPoint[key]);
            if (filtered) {
                return filtered;
            }
        }
        return false;
    }

    //Returns the filtered data
    this.filtered = function(_data = data) {
        return _data.filter(d => !this.isFiltered(d));
    }

    // Mark filtered element
    this.mark = function(_data = data) {
        _data.forEach(d => {
            d.filtered = this.isFiltered(d)            
        });
    }

    //if it is a RangeFilter it returns: [[min, max],[min, max]]
    //if it is a CollectionFilter it returns: [[v1,v2],[v3],[v4]] or [[v4]]
    this.get = function(key) {
        var _filter = _filters[key]
        return (_filter || []).map(filter => filter.values);
    }
}


function Color(colors, _key = "food_group", didUpdateCallback = null) {
    this.key = ""
    this.colorsScale = d3.scaleOrdinal(colors);
    this.colorBy = function (key, _data = data) {
        this.key = key;
        var unique = Array.from(new Set(_data.map(d => d[this.key])));
        this.colorsScale.domain(unique.sort());
    }

    // returns the color for the dataPoint
    this.forData = function(dataPoint) {
        return this.forValue(dataPoint[this.key])
    }
    
    // returns the color for the value
    this.forValue = function(val) {
        return this.colorsScale(val);
    }

    // Change color coding
    this.setColors = function(colors, callback = true) {
        this.colorsScale = this.colorsScale.range(colors);
        if (callback && didUpdateCallback) {
            didUpdateCallback();
        }
    }

    this.getColors = function() {
        return this.colorsScale.range();
    }

    // Grouped data 
    this.groupedData = function(_data = data) {
        return d3.group(_data, this.key);
    }

    this.domain = function() {
        return this.colorsScale.domain().sort();
    }

    this.setColors(colors, false);
    this.colorBy(_key);
}

/*
    Extend d3
*/

// Get the range of the values
// The key is Optional
// returns [minVal, maxVal]
d3.range = function(key, _data = data) {
    var values = key ? _data.map(d => d[key]) : _data;
    return d3.extent(values);
}

d3.group = function(key, _data = data) {
    var groups = {};
    _data.forEach(function (d) {
        if (!groups[d[key]]) {
            groups[d[key]] = []
        }
        groups[d[key]].push(d)
    });
    return groups;
}

// cancels any selections related to the writeup div
function all_deselect() {
	scatterplot.deselect();
}

// sets the writeup div to show the default instructions
function show_instructions() {
	all_deselect();
	d3.select("#writeup").html("<h3>Instructions</h3>\
	<h5>Scatter Plot</h5>\
	<p> Mouse over any data point to display a tooltip with information on that point.  Click any data point to select it and replace the information here with information on that food.  Click and drag to lasso multiple data points and filter the parallel coordinates plot.  </p>\
	<h5>Parallel Coordinates</h5>\
	<p> Brush along any axis to filter.  Shift-click while doing so for multiple filters.  Hover over an axis to display a label.  </p>\
	<h5>Sunburst Plot</h5>\
	<p> Interactions soon to come!</p>\
	<h5>Tooltips</h5>\
	<p> Soon to come!</p>")
}