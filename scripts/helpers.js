function Filter() {
    var _filters = {};

    // Key is optional
    // If Key == null will clear all filters
    this.clear = function(key) {
        if (key) {
            delete _filters[key];
        } else {
            _filters = {};
        }
    }

    // Range is an array:
    // if values are scalars: [minVal, maxVal]
    // TODO: implement categorical filtering
    this.add = function(key, range) {
        _filters[key] = range;
    }

    // Returns true if the value is filtered on the key
    this.isFilteredKV = function(key, value) {
        var filter = _filters[key];
        return filter && (value < filter[0] || value > filter[1]);
    }

    // Returns true if the data point is filtered for any of it's keys
    this.isFiltered = function(dataPoint) {
        for (var key in _filters) {
            var value = dataPoint[key];
            if (this.isFilteredKeyValue(key, value)) {
                return true;
            }
        }
        return false;
    }
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
