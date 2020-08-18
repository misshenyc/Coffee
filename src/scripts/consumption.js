let coffeeData = [];

d3.csv("src/assets/data/us-coffee.csv", function (d) {
    return {
        year: d.year,
        coffee: +d.coffee
    };
}).then(function (rows) {
    coffeeData = rows;
    console.log(coffeeData);
    barchart('#chart1');
});

function barchart(selector) {
    let w = 1200;
    let h = 500;
    let arrayLength = coffeeData.length;
    let maxValue = d3.max(coffeeData, function (d) { return +d.coffee; });
    let x_axisLength = 1000;
    let y_axisLength = 300;
    let yScale = d3.scaleLinear()
        .domain([0, maxValue])
        .range([0, y_axisLength]);

    let svg = d3.select(selector)
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    svg.selectAll("rect")
        .data(coffeeData)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            return i * (x_axisLength / arrayLength) + 30;
        })
        .attr("y", function (d) {
            return h - d.coffee * (y_axisLength / maxValue);
        })
        .attr("width", (x_axisLength / arrayLength) - 1)
        .attr("height", function (d) {
            return d.coffee * (y_axisLength / maxValue);
        })
        .attr("fill", "steelblue")
        .on("mouseover", function (d) {
            return tooltip.style("visibility", "visible").text(d.year + ": " + d.coffee);
        })
        .on("mousemove", function (d) {
            return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px").text(d.year + ": " + d.coffee);
        })
        .on("mouseout", function (d) {
            return tooltip.style("visibility", "hidden");
        });

    svg.append("line")
        .attr("x1", 30)
        .attr("y1", 75)
        .attr("x2", 30)
        .attr("y2", 575)
        .attr("stroke-width", 2)
        .attr("stroke", "black");

    svg.append("line")
        .attr("x1", 30)
        .attr("y1", 500)
        .attr("x2", 1500)
        .attr("y2", 500)
        .attr("stroke-width", 2)
        .attr("stroke", "black");

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .text("Average Coffee Consumption (lbs) Per Person")
        .attr("transform", "translate(20, 300) rotate(-90)")
        .attr("font-size", "14")
        .attr("font-family", "'Open Sans', sans-serif");

    let tooltip = d3.select(selector)
        .append("div")
        .style("position", "absolute")
        .style("font-family", "'Open Sans', sans-serif")
        .style("font-size", "12px")
        .style("z-index", "10")
        .style("visibility", "hidden");
};
