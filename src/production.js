let d3 = require("d3");

function render() {
    d3.csv('./assets/data/production.csv')
        .then(function(data) {
            let margin = { top: 50, right: 100, bottom: 50, left: 100 },
                width = 1200 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            let treeSVG = d3.select("#production")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            let root = d3.stratify()
                .id(function (d) { return d.name; })
                .parentId(function (d) { return d.parent; })
                (data);
            root.sum(function (d) { return +d.value })

            let color = d3.scaleOrdinal()
                .domain(['April','July','October'])
                .range(["#335c67", "#e09f3e", "#9e2a2b"])

            d3.treemap()
                .size([width, height])
                .padding(5)
                .paddingTop(20)
                (root)

            // console.log(root.leaves())

            treeSVG
                .selectAll("rect")
                .data(root.leaves())
                .enter()
                .append("rect")
                .attr('x', function (d) { return d.x0; })
                .attr('y', function (d) { return d.y0; })
                .attr('width', function (d) { return d.x1 - d.x0; })
                .attr('height', function (d) { return d.y1 - d.y0; })
                .style("stroke", "black")
                .style("fill", function(d) {return color(d.parent.data.name)});

            treeSVG
                .selectAll('continent')
                .data(root.descendants().filter(function(d){return d.depth == 1}))
                .enter()
                .append('text')
                    .attr("x", function (d) { return d.x0 + 10})
                    .attr("y", function (d) { return d.y0 + 10 })
                    .text(function (d) { return d.data.name })
                    .attr("font-size", "20px")
                    .attr("fill", function(d){return color(d.data.name)})
            
            treeSVG
                .selectAll("country")
                .data(root.leaves())
                .enter()
                .append("text")
                    .attr("x", function (d) { return d.x0 + 5 })   
                    .attr("y", function (d) { return d.y0 + 10})   
                    .text(function (d) { return d.data.name })
                    .attr("font-size", "12px")
                    .attr("fill", "white")
    });
}

module.exports = {render};
