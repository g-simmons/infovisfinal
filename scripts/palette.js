function displaypalette(food,index,svg,margin) {
	
	var margins = 10
	var theight = 50
	var padding = 2
	var boxsize = 10
	var choices = 8
	
	var box = svg.append('g')
		.attr("transform", "translate(" + margin + " ," + margin + ")")
		.attr('width',margins*2+boxsize*choices*choices+padding*(choices*choices-1))
		.attr('height',margins*2+theight+boxsize*choices+padding*(choices-1))
	
	box.append('rect')
		.attr('fill','#ffffff')
		.attr('stroke','#000000')
		.attr('x',0)
		.attr('y',0)
		.attr('width',margins*2+boxsize*choices*choices+padding*(choices*choices-1))
		.attr('height',margins*2+theight+boxsize*choices+padding*(choices-1))
		.on('click',function(){
			box.remove()
		})
	
	box.append('text')
		.attr('x',margins)
		.attr('y',margins)
		.attr('style','dominant-baseline: hanging; font-size: 20')
		.text('Click a color to change the display color for '+food)
		
	box.append('text')
		.attr('x',margins)
		.attr('y',margins)
		.attr('dy','1.2em')
		.attr('style','dominant-baseline: hanging; font-size: 20')
		.text('Or click (without dragging!) this white pane to exit')
	
	for(i=0;i<choices;i++) {
		var r = Math.round(i*255/choices)
		for(j=0;j<choices;j++) {
			var g = Math.round(j*255/choices)
			for(k=0;k<choices;k++) {
				var b = Math.round(k*255/choices)
				var colour = 'rgb('+r+','+g+','+b+')'
				
				box.append('rect')
					.attr('fill',colour)
					.attr('width',boxsize)
					.attr('height',boxsize)
					.attr('y',margins+theight+i*(boxsize+padding))
					.attr('x',margins+j*(boxsize+padding)+k*((boxsize+padding)*choices))
					.on('click',function(){
						colorscheme[index] = d3.select(this).attr('fill')
						color = new Color(colorscheme);
						/*update all visualizations here*/
						box.remove()
					})
			}
		}
	}
}