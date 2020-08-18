let coffeeData = [];

d3.csv("src/assets/data/us-coffee.csv", function (d) {
    return {
        year: d.year,
        coffee: +d.coffee
    };
}).then(function (rows) {
    coffeeData = rows;
    // console.log(coffeeData);
    barchart('#chart1');
});

function barchart(selector, mouseOver, mouseOut) {
    let margin = { top: 10, right: 30, bottom: 90, left: 50 },
        width = 1300 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    let svg = d3.select(selector)
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
        .domain(coffeeData.map(function (d) { return d.year; }))
        .padding(0.15);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "middle");

    let y = d3.scaleLinear()
        .domain([8, 11])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .style('text-anchor', 'middle')
        .attr('y', 0-margin.left/5*4)
        .attr('x', 0-(height/2))
        .text('Average lbs per person per year')

    svg.selectAll("bar")
        .data(coffeeData)
        .enter()
        .append("rect")
        .attr("x", function (d) { return x(d.year); })
        .attr("width", x.bandwidth())
        .attr("fill", "#dda15e")
            .attr("y", d => { return height; })
            .attr("height", 0)
            .transition()
            .duration(400)
            .delay(function (d, i) {return i * 50})
            .attr("y", d => { return y(d.coffee); })
            .attr("height", d => { return height - y(d.coffee); })
        .on("mouseover", mouseOver())
        .on("mouseout", mouseOut())
};

function MouseOver(d, i) {
    d3.select(this).attr('class', 'highlight');
    d3.select(this)
        .transition()     
        .duration(400)
        .attr('width', x.bandwidth() + 5)
        .attr("y", function (d) { return y(d.coffee) - 10; })
        .attr("height", function (d) { return height - y(d.coffee) + 10; });

    g.append("text")
        .attr('class', 'val')
        .attr('x', function () {
            return x(d.year);
        })
        .attr('y', function () {
            return y(d.coffee) - 15;
        })
        .text(function () {
            return [d.coffee]; 
        });
}
