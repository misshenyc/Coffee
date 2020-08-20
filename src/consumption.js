let d3 = require("d3");

function render() {
    d3.csv("../assets/data/us-coffee.csv", function (d) {
        return {
            year: d.year,
            coffee: +d.coffee
        };
    }).then(function (rows) {
        barchart(rows, '#consumption');
    });
}

function barchart(data, selector) {
    let margin = { top: 50, right: 100, bottom: 50, left: 100 },
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let barSVG = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");


    let tooltip = d3.select('body')
        .append("div")
        .style("position", "absolute")
        .style("font-family", "'Open Sans', sans-serif")
        .style("font-size", "12px")
        .style("z-index", "10")
        .style("visibility", "hidden");

    let x = d3.scaleBand()
        .range([0, width])
        .domain(data.map(function (d) { return d.year; }))
        .padding(0.15);
    barSVG.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "middle");

    let y = d3.scaleLinear()
        .domain([8, 11])
        .range([height, 0]);
    barSVG.append("g")
        .call(d3.axisLeft(y));
    barSVG.append('text')
        .attr('transform', 'rotate(-90)')
        .style('text-anchor', 'middle')
        .attr('y', 0-margin.left/5*4)
        .attr('x', 0-(height/2))
        .text('Average lbs per person per year')

    barSVG.selectAll("bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.year); })
        .attr("width", x.bandwidth())
        .on("mouseover", function (d) {
            return tooltip.style("visibility", "visible").text(d.year + ": " + d.coffee);
        })
        .on("mousemove", function (d) {
            return tooltip.style("top", (d3.event.pageY - 10) + "px")
                .style("left", (d3.event.pageX + 10) + "px")
                .text("average coffee/person in " + d.year + ':' + d.coffee )
        })
        .on("mouseout", function (d) {
            return tooltip.style("visibility", "hidden");
        })
        .attr("fill", "#dda15e")
            .attr("y", d => { return height; })
            .attr("height", 0)
            .transition()
            .duration(400)
            .delay(function (d, i) {return i * 50})
            .attr("y", d => { return y(d.coffee); })
            .attr("height", d => { return height - y(d.coffee); })


};

module.exports = { render };
