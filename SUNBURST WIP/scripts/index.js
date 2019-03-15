var sunburst
 = undefined;
d3.csv('data/data.csv',function(error,data){
	if(error) throw error;
	data.forEach(function(d){
		d.amount=+d.amount
	})
	
	sunburst = new Sunburst(d3.select('.sun'), data);
})