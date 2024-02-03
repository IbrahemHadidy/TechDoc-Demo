import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
d3.json(
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"
).then((data) => {
  // Define chart dimensions
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Parse the date/time
  const parseDate = d3.timeParse("%Y-%m-%d");

  // Format the date/time
  const formatDate = d3.timeFormat("%Y-%m-%d");

  // Format the GDP value
  const formatGDP = d3.format(".2f");

  // Convert data date strings to Date objects
  data.data.forEach((d) => {
    d.date = parseDate(d[0]);
    d.gdp = +d[1];
  });

  // Create SVG element
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Define scales
  const xScale = d3
    .scaleTime()
    .domain(d3.extent(data.data, (d) => d.date))
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.data, (d) => d.gdp)])
    .range([height, 0]);

  // Define axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  const tooltip = d3
    .select("#chart")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", "0")
    .attr("data-date", "");

  // Append title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 4)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .attr("id", "title")
    .text(data.source_name);

  // Append axes
  svg
    .append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  svg.append("g").attr("id", "y-axis").call(yAxis);

  // Append bars
  svg
    .selectAll(".bar")
    .data(data.data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("data-date", (d) => formatDate(d.date))
    .attr("data-gdp", (d) => formatGDP(d.gdp))
    .attr("x", (d) => xScale(d.date))
    .attr("y", (d) => yScale(d.gdp))
    .attr("width", width / data.data.length)
    .attr("height", (d) => height - yScale(d.gdp))
    .on("mouseover", (event, d) => {
      const tooltip = d3.select("#tooltip");
      tooltip.html(
        `${d[0]}<br> ${new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD"
        }).format(d[1])} Billion`
      );
      tooltip.attr("data-date", d[0]);

      const chartPosition = d3.select("#chart").node().getBoundingClientRect();
      const xPosition = event.pageX - chartPosition.left + 10;
      const yPosition =
        event.pageY - chartPosition.top - tooltip.node().offsetHeight - 10;

      tooltip
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .style("opacity", 1);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").style("opacity", 0);
    });
});
