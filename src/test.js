let d3 = require("d3");

const years = d3.range(1790, 2000, 10);

// Helpers.

function nest(data, ...years) {
  const nest = d3.nest();
  for (const key of years) nest.key(key);
  function hierarchy({ key, values }, depth) {
    return {
      name: key,
      children: depth < years.length - 1
        ? values.map(d => hierarchy(d, depth + 1))
        : values
    };
  }
  return nest.entries(data).map(d => hierarchy(d, 0));
}

// Entry point - read data
d3.tsv(
  "../assets/data/population.tsv",
  (d, i) => i === 0 ? null : ({ name: d[""], values: years.map(key => +d[key].replace(/,/g, "") || 1e-6) })
).then(function(statesRows) {
  d3.csv("../assets/data/census-regions.csv", null).then(function(regionsRows) {
    productionSquares(regionsRows, statesRows)
  });
});

function productionSquares(regions, states) {
  const regionByState = new Map(regions.map(d => [d.State, d.Region]));
  const divisionByState = new Map(regions.map(d => [d.State, d.Division]));
  let data = { years, children: nest(states, d => regionByState.get(d.name), d => divisionByState.get(d.name)) };
  render(data);
}

// Render data.
function render(data) {
   let margin = { top: 100, right: 100, bottom: 100, left: 100 },
     width = 1200 - margin.left - margin.right,
     height = 700 - margin.top - margin.bottom;
  let color = d3.scaleOrdinal(data.children.map(d => d.name), d3.schemeCategory10.map(d => d3.interpolateRgb(d, "white")(0.5)));
  // console.log(data)
  let sums = data.years.map((d, i) => d3.hierarchy(data).sum(d => d.values ? Math.round(d.values[i]) : 0).value)
  let max = d3.max(sums);
  let formatNumber = d3.format(",d");
  let parseNumber = string => +string.replace(/,/g, "");
  let duration = 2500;

  let index = Scrubber(d3.range(data.years.length), {
    delay: duration,
    loop: false,
    format: i => data.years[i]
  })

  let treemap = d3.treemap()
      .tile(d3.treemapResquarify)
      .size([width, height])
      .padding(d => d.height === 1 ? 1 : 0)
      .round(true);

  // Compute the structure using the average value.
  let root = treemap(d3.hierarchy(data)
      .sum(d => d.values ? d3.sum(d.values) : 0)
      .sort((a, b) => b.value - a.value));

  let svg = d3.create("svg")
      .attr("viewBox", `0 -20 ${width} ${height + 20}`)
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .style("overflow", "visible");

  let box = svg.append("g")
    .selectAll("g")
    .data(data.years.map((key, i) => {
      let value = root.sum(d => d.values ? d.values[i] : 0).value;
      return {key, value, i, k: Math.sqrt(value / max)};
    }).reverse())
    .join("g")
      .attr("transform", ({k}) => `translate(${(1 - k) / 2 * width},${(1 - k) / 2 * height})`)
      .attr("opacity", ({i}) => i >= index.value ? 1 : 0)
      .call(g => g.append("text")
          .attr("y", -6)
          .attr("fill", "#777")
        .selectAll("tspan")
        .data(({key, value}) => [key, ` ${formatNumber(value)}`])
        .join("tspan")
          .attr("font-weight", (d, i) => i === 0 ? "bold" : null)
          .text(d => d))
      .call(g => g.append("rect")
          .attr("fill", "none")
          .attr("stroke", "#ccc")
          .attr("width", ({k}) => k * width)
          .attr("height", ({k}) => k * height));

  let leaf = svg.append("g")
    .selectAll("g")
    .data(layout(index.value))
    .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

  leaf.append("rect")
      .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
      .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0);

  leaf.append("clipPath")
      .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
    .append("use")
      .attr("xlink:href", d => d.leafUid.href);

  leaf.append("text")
      .attr("clip-path", d => d.clipUid)
    .selectAll("tspan")
    .data(d => [d.data.name, formatNumber(d.value)])
    .join("tspan")
      .attr("x", 3)
      .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
      .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
      .text(d => d);

  leaf.append("title")
      .text(d => d.data.name);

  function layout(index) {
    let k = Math.sqrt(root.sum(d => d.values ? d.values[index] : 0).value / max);
    let x = (1 - k) / 2 * width;
    let y = (1 - k) / 2 * height;
    return treemap.size([width * k, height * k])(root)
      .each(d => (d.x0 += x, d.x1 += x, d.y0 += y, d.y1 += y))
      .leaves();
  }

  return Object.assign(svg.node(), {
    update(index) {
      box.transition()
          .duration(duration)
          .attr("opacity", ({i}) => i >= index ? 1 : 0);

      leaf.data(layout(index)).transition()
          .duration(duration)
          .ease(d3.easeLinear)
          .attr("transform", d => `translate(${d.x0},${d.y0})`)
          .call(leaf => leaf.select("rect")
              .attr("width", d => d.x1 - d.x0)
              .attr("height", d => d.y1 - d.y0))
          .call(leaf => leaf.select("text tspan:last-child")
              .tween("text", function(d) {
                let i = d3.interpolate(parseNumber(this.textContent), d.value);
                return function(t) { this.textContent = formatNumber(i(t)); };
              }));
    }
  });
}

function Scrubber(
  values,
  {
    format = (value) => value,
    initial = 0,
    delay = null,
    autoplay = true,
    loop = true,
    loopDelay = null,
    alternate = false,
  } = {}
) {
  values = Array.from(values);
  let form = html `<form id='scrubber-form' style="font: 12px var(--sans-serif); font-variant-numeric: tabular-nums; display: flex; height: 33px; align-items: center;">
      <button name="b" type="button" style="margin-right: 0.4em; width: 5em;"></button>
      <label style="display: flex; align-items: center;">
        <input name="i" type="range" min="0" max=${values.length - 1} value=${initial} step="1" style="width: 180px;" />
        <output name="o" style="margin-left: 0.4em;"></output>
      </label>
    </form>`;
  let frame = null;
  let timer = null;
  let interval = null;
  let direction = 1;
  function start() {
    form.b.textContent = "Pause";
    if (delay === null) frame = requestAnimationFrame(tick);
    else interval = setInterval(tick, delay);
  }
  function stop() {
    form.b.textContent = "Play";
    if (frame !== null) cancelAnimationFrame(frame), (frame = null);
    if (timer !== null) clearTimeout(timer), (timer = null);
    if (interval !== null) clearInterval(interval), (interval = null);
  }
  function running() {
    return frame !== null || timer !== null || interval !== null;
  }
  function tick() {
    if (
      form.i.valueAsNumber ===
      (direction > 0 ? values.length - 1 : direction < 0 ? 0 : NaN)
    ) {
      if (!loop) return stop();
      if (alternate) direction = -direction;
      if (loopDelay !== null) {
        if (frame !== null) cancelAnimationFrame(frame), (frame = null);
        if (interval !== null) clearInterval(interval), (interval = null);
        timer = setTimeout(() => (step(), start()), loopDelay);
        return;
      }
    }
    if (delay === null) frame = requestAnimationFrame(tick);
    step();
  }
  function step() {
    form.i.valueAsNumber =
      (form.i.valueAsNumber + direction + values.length) % values.length;
    form.i.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  }
  form.i.oninput = (event) => {
    if (event && event.isTrusted && running()) stop();
    form.value = values[form.i.valueAsNumber];
    form.o.value = format(form.value, form.i.valueAsNumber, values);
  };
  form.b.onclick = () => {
    if (running()) return stop();
    direction =
      alternate && form.i.valueAsNumber === values.length - 1 ? -1 : 1;
    form.i.valueAsNumber = (form.i.valueAsNumber + direction) % values.length;
    form.i.dispatchEvent(new CustomEvent("input", { bubbles: true }));
    start();
  };
  form.i.oninput();
  if (autoplay) start();
  else stop();
  disposal(form).then(stop);
  return form;
}

function disposal(element) {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      let target = element.closest(".observablehq");
      if (!target) return resolve();
      let observer = new MutationObserver((mutations) => {
        if (target.contains(element)) return;
        observer.disconnect(), resolve();
      });
      observer.observe(target, { childList: true });
    });
  });
}

