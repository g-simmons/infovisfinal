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
            return this.values.includes(value);
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
    }

    // Set the value of the filter, defaults to the top filter.
    // Range is an array:
    // If isRange == true: [minVal, maxVal]
    // else [val1, val2, val3, ...]
    this.set = function (key, values, isRange = true, idx = null) {
        idx = !idx ? _filters[key].length - 1 : idx;

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
        for (var filter in _filters[key]) {
            if (filter.isFiltered(value)) {
                return true;
            }
        }
        return false;
    }

    // Returns true if the data point is filtered for any of it's keys
    this.isFiltered = function(dataPoint) {
        for (var key in _filters) {
            if (this.isFilteredKeyValue(key, dataPoint[key])) {
                return true;
            }
        }
        return false;
    }

    this.filtered = function(data = data) {
        return data.filter(d => !this.isFiltered(d));
    }

    //if it is a RangeFilter it returns: [[min, max],[min, max]]
    //if it is a CollectionFilter it returns: [v1,v2,v3,v4]
    this.get = function(key) {
        var _filter = _filters[key]
        var values = (_filter || []).map(filter => filter.values)
        return values;
    }
}


function Color(colors) {    
    this.key = function() {
        return "keyValue";
    }

    // returns the color for the dataPoint
    this.forData = function(dataPoint) {
        return this.forValue(dataPoint[this.key()])
    }
    
    // returns the color for the value
    this.forValue = function(val) {
        return this.colorsScale(val, this.key());
    }

    // Change color coding
    this.setColors = function(colors) {
        this.colorsScale = d3.scaleOrdinal(colors);
    }

    // Grouped data 
    this.groupedData = function(data = data) {
        return d3.group(data, this.key());
    }

    this.updateDomain = function(data = data) {
        var unique = Array.from(new Set(data.map(d => d[this.key()])));
        this.colorsScale.domain(unique.sort());
    }

    this.setColors(colors)
}

/*
    Extend d3
*/

// Get the range of the values
// The key is Optional
// returns [minVal, maxVal]
d3.range = function(key, data = data) {
    var values = key ? data.map(d => d[key]) : data;
    return d3.extent(values);
}

d3.group = function(key, data = data) {
    var groups = {};
    data.forEach(function (d) {
        if (!groups[d[key]]) {
            groups[d[key]] = []
        }
        groups[d[key]].push(d)
    });
    return groups;
}
