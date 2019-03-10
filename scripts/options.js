var shiftKeyPressed = false;
d3.select(window).on("keydown", function () {
    shiftKeyPressed = d3.event.shiftKey || shiftKeyPressed;
}).on("keyup", function () {
    shiftKeyPressed = d3.event.keyCode == 16 ? false : shiftKeyPressed;    
})

d3.select("#optionsToggle").on("change", function () {
    d3.select("#optionsPanel").classed("closed", !this.checked)
});