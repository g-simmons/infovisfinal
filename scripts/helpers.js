function Filter() {
    var _filters = {};

    function RangeFilter(range) {
        this.values = range;
        this.isFiltered = function (value) {
            return (value < this.values[0] || value > this.values[1])
        }
    }

    function CollectionFilter(values) {
        this.values = values;
        this.isFiltered = function (value) {
            return this.values.includes(value);
        }
    }

    function filterSelector(values, isRange = true) {
        return isRange ? new RangeFilter(values) : new CollectionFilter(values);
    }

    // Key is optional
    // If Key == null will clear all filters
    this.clear = function(key) {
        if (key) {
            delete _filters[key];
        } else {
            _filters = {};
        }
    }

    // Add multiple filters
    this.add = function(key, values, isRange = true) {
        if (!_filters[key]) {
            this.set(key, values, isRange);
        } else {
            _filters[key].push(filterSelector(values, isRange));
        }
    }

    // Range is an array:
    // If isRange == true: [minVal, maxVal]
    // else [val1, val2, val3, ...]
    this.set = function (key, values, isRange = true) {
        _filters[key] = [filterSelector(values, isRange)];
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

    this.filtered = function(data) {
        return data.filter(d => !this.isFiltered(d));
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
    this.groupedData = function(data) {
        return d3.group(data, this.key());
    }

    this.updateDomain = function(data) {
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
d3.range = function(data, key) {
    var values = key ? data.map(d => d[key]) : data;
    return [d3.min(values), d3.max(values)]
}

d3.group = function(data, key) {
    var groups = {};
    data.forEach(function (d) {
        if (!groups[d[key]]) {
            groups[d[key]] = []
        }
        groups[d[key]].push(d)
    });
    return groups;
}
