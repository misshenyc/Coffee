// d3 = require("d3@5")

let data = [];

d3.csv("src/assets/data/price.csv", function(d){
    return { 
        name: d.year, 
        x: +d.purchase_price, 
        y: +d.retail_price 
    };
}).then(function(rows){
    data = rows;
    // console.log(data);
    scatterplot('#chart2')
});
    // data.x = "Cents per Pound";
    // data.y = "Dollars per Pound";

function scatterplot(selector){
    // replay;
    let width = 1200;
    let height = 720;
    let margin = ({ top: 20, right: 30, bottom: 30, left: 40 })
    let x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.x)).nice()
        .range([margin.left, width - margin.right])

    let y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.y)).nice()
        .range([height - margin.bottom, margin.top])

    let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("y2", -height)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", width - 4)
            .attr("y", -4)
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .text(data.x)
            .call(halo))

    let yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).ticks(null, "$.2f"))
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width)
            .attr("stroke-opacity", 0.1))
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text(data.y)
            .call(halo))

    function halo(text) {
        text.select(function () { return this.parentNode.insertBefore(this.cloneNode(true), this); })
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round");
    }

    function length(path) {
        return d3.create("svg:path").attr("d", path).node().getTotalLength();
    }

    let line = d3.line()
        .curve(d3.curveCatmullRom)
        .x(d => x(d.x))
        .y(d => y(d.y))

    let svg = d3.select(selector)
        .append("svg")
        .attr("viewBox", [0, 0, width, height]);

    let l = length(line(data));

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", `0,${l}`)
        .attr("d", line)
        .transition()
        .duration(5000)
        .ease(d3.easeLinear)
        .attr("stroke-dasharray", `${l},${l}`);

    svg.append("g")
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.x))
        .attr("cy", d => y(d.y))
        .attr("r", 3);

    let label = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .selectAll("g")
        .data(data)
        .join("g")
        .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`)
        .attr("opacity", 0);

    label.append("text")
        .text(d => d.name)
        .each(function (d) {
            let t = d3.select(this);
            switch (d.orient) {
                case "top": t.attr("text-anchor", "middle").attr("dy", "-0.7em"); break;
                case "right": t.attr("dx", "0.5em").attr("dy", "0.32em").attr("text-anchor", "start"); break;
                case "bottom": t.attr("text-anchor", "middle").attr("dy", "1.4em"); break;
                case "left": t.attr("dx", "-0.5em").attr("dy", "0.32em").attr("text-anchor", "end"); break;
            }
        })
        .call(halo);

    label.transition()
        .delay((d, i) => length(line(data.slice(0, i + 1))) / l * (5000 - 125))
        .attr("opacity", 1);

    return svg.node();
}


