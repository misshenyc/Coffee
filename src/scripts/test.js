const years = d3.range(1790, 2000, 10);

// Helpers.

function nest(data, ...keys) {
  const nest = d3.nest();
  for (const key of keys) nest.key(key);
  function hierarchy({ key, values }, depth) {
    return {
      name: key,
      children: depth < keys.length - 1
        ? values.map(d => hierarchy(d, depth + 1))
        : values
    };
  }
  return nest.entries(data).map(d => hierarchy(d, 0));
}

// Entry point.
d3.tsv(
  "src/assets/data/population.tsv",
  (d, i) => i === 0 ? null : ({ name: d[""], values: years.map(key => +d[key].replace(/,/g, "") || 1e-6) })
).then(function(statesRows) {
  d3.csv("src/assets/data/census-regions.csv", null).then(function(regionsRows) {
    productionSquares(regionsRows, statesRows)
  });
});

function productionSquares(regions, states) {
  const regionByState = new Map(regions.map(d => [d.State, d.Region]));
  const divisionByState = new Map(regions.map(d => [d.State, d.Division]));
  let data = { years, children: nest(states, d => regionByState.get(d.name), d => divisionByState.get(d.name)) };

  console.log(data);
  render(data);
}

function render(data) {
}
