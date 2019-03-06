d3.select("#optionsToggle").on("change", function () {
    d3.select("#optionsPanel").classed("closed", !this.checked)
});