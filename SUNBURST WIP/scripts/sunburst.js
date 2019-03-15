function Sunburst(svg, data) {

    var margins = 50

    this.svg = svg;
    
    // grab the bounding box of the container
    var boundingBox = svg.node().getBoundingClientRect();

    //  grab the width and height of our containing SVG
    var svgHeight = boundingBox.height;
    var svgWidth = boundingBox.width;
	var height = svgHeight - 2*margins
	var width = svgWidth-2*margins
	var r3 = Math.min(height,width)/2
	var r2 = 2*r3/3
	var r1 = 1*r3/3
	var r0 = 0*r3/3
	
	var g = svg.append('g')
		.attr('transform', 'translate('+(svgWidth/2)+',' + (svgHeight/2) + ')')
	
	
	// Track how much has been drawn at each level
	var drawn_i = 0
	var drawn_j = 0
	var drawn_k = 0
	var k_sum = 0
	
	for(i=0;i<data.length;i++)
	{
		data[i].startAngle = k_sum;
		k_sum += data[i].amount;
		data[i].endAngle = k_sum;
	}
	
	// Sort the data so it renders in the correct order
	data.sort(function(x,y){
		return d3.ascending(x.subklass,y.subklass)
	})
	data.sort(function(x,y){
		return d3.ascending(x.klass,y.klass)
	})
	data.sort(function(x,y){
		return d3.ascending(x.superklass,y.superklass)
	})
	
	// Find and store the total amount of all things
	var sum_all = 0;
	for(i=0;i<data.length;i++) {
		sum_all += data[i].amount
	}
	
	var theta = d3.scaleLinear()
		.domain([0,sum_all])
		.range([0,2*Math.PI]);
	
	data_i = data
	while(data_i.length > 0) {
		// Extract a superklass
		var data_sup = data.filter(function(d){return d.superklass==data_i[0].superklass})
		var sum_sup = 0;
		for(i=0;i<data_sup.length;i++) {
			sum_sup += data_sup[i].amount
		}
		
		// Render the superklass arc
		var arc_i = d3.arc()
			.startAngle(function(){return theta(drawn_i)})
			.endAngle(function(){return theta(drawn_i+sum_sup)})
			.innerRadius(function(){return r0})
			.outerRadius(function(){return r1})
		g.append('path')
			.attr('d',arc_i())
			.attr('fill-opacity',0)
			.attr('stroke','#000000')
		g.append('text')
			.attr('x',arc_i.centroid()[0])
			.attr('y',arc_i.centroid()[1])
			.text(data_i[0].superklass)
		drawn_i+=sum_sup
		
		// Recurse!  Manually!  
		data_j = data_sup
		while(data_j.length > 0) {
			var data_kla = data_i.filter(function(d){return d.klass==data_j[0].klass})
			var sum_kla = 0;
			for(i=0;i<data_kla.length;i++) {
				sum_kla += data_kla[i].amount
			}
			
			// Render the klass arc
			var arc_j = d3.arc()
				.startAngle(function(){return theta(drawn_j)})
				.endAngle(function(){return theta(drawn_j+sum_kla)})
				.innerRadius(function(){return r1})
				.outerRadius(function(){return r2})
			g.append('path')
				.attr('d',arc_j())
				.attr('fill-opacity',0)
				.attr('stroke','#000000')
			g.append('text')
				.attr('x',arc_j.centroid()[0])
				.attr('y',arc_j.centroid()[1])
				.text(data_j[0].klass)
			drawn_j+=sum_kla
				
			// Recurse!  Manually!  
			data_k = data_kla
			var div = g.append('g')
			while(data_k.length > 0) {
				var data_sub = data_k
				
				// Render the subklass arc
				var arc_k = d3.arc()
					.startAngle(function(d){return theta(d.startAngle)})
					.endAngle(function(d){return theta(d.endAngle)})
					.innerRadius(function(){return r2})
					.outerRadius(function(){return r3})
				div.selectAll('path')
					.data(data_sub)
					.enter().append('path')
					.attr('d',arc_k)
					.attr('fill-opacity',0)
					.attr('stroke','#000000')
				div.selectAll('text')
					.data(data_sub)
					.enter().append('text')
					.attr('x',function(d){return arc_k.centroid(d)[0]})
					.attr('y',function(d){return arc_k.centroid(d)[1]})
					.text(function(d){return d.subklass})
				
				// Done with this subklass, prune it
				data_k = data_k.filter(function(d){return d.subklass!=data_sub[0].subklass})
			}
			
			
			// Done with this klass, prune it
			data_j = data_j.filter(function(d){return d.klass!=data_kla[0].klass})
		}
		
		// Done with this superklass, prune it
		data_i = data_i.filter(function(d){return d.superklass!=data_sup[0].superklass})
	}
	
	g.selectAll('text')
		.attr('style','dominant-baseline: middle; text-anchor: middle; font-size: 10')
}
