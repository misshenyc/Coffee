d3.csv('src/assets/data/production.csv')
    .then(function(data) {
        let margin = { top: 100, right: 100, bottom: 100, left: 100 },
            width = 1200 - margin.left - margin.right,
            height = 700 - margin.top - margin.bottom;

        let treeSVG = d3.select("#chart3")
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
            console.log(root)
        root.sum(function (d) { return +d.value })

        d3.treemap()
            .size([width, height])
            .padding(10)
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
            .style("fill", "#69b3a2");

        treeSVG
            .selectAll("text")
            .data(root.leaves())
            .enter()
            .append("text")
                .attr("x", function (d) { return d.x0 + 10 })    // +10 to adjust position (more right)
                .attr("y", function (d) { return d.y0 + 20 })    // +20 to adjust position (lower)
                .text(function (d) { return d.data.name })
                .attr("font-size", "15px")
                .attr("fill", "white")
})
