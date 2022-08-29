import React from "react";
import * as d3 from "d3";

const dimensions = {
  width: 600,
  height: 300,
  margin: { top: 30, right: 30, bottom: 30, left: 60 },
};

type Dimension = typeof dimensions;

const SpaceChart = ({ data, dimensions }: { data: any; dimensions: Dimension }) => {
  const svgRef = React.useRef(null);
  const { width, height, margin } = dimensions;
  const svgWidth = width + margin.left + margin.right;
  const svgHeight = height + margin.top + margin.bottom;

  React.useEffect(() => {
    // Create root container where we will append all other chart elements
    const svg = d3.select(svgRef.current);
    // Clear svg content before adding new elements
    svg.selectAll("*").remove();

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    var simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3.forceLink().id(function (d) {
          return d.id;
        })
      )
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

    d3.json("miserables.json", function (error, graph) {
      if (error) throw error;

      var link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(graph.links)
        .enter()
        .append("line")
        .attr("stroke-width", function (d) {
          return Math.sqrt(d.value);
        });

      var node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("g");

      var circles = node
        .append("circle")
        .attr("r", 5)
        .attr("fill", function (d) {
          return color(d.group);
        });

      // Create a drag handler and append it to the node object instead
      var drag_handler = d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

      drag_handler(node);

      var lables = node
        .append("text")
        .text(function (d) {
          return d.id;
        })
        .attr("x", 6)
        .attr("y", 3);

      node.append("title").text(function (d) {
        return d.id;
      });

      simulation.nodes(graph.nodes).on("tick", ticked);

      simulation.force("link").links(graph.links);

      function ticked() {
        link
          .attr("x1", function (d) {
            return d.source.x;
          })
          .attr("y1", function (d) {
            return d.source.y;
          })
          .attr("x2", function (d) {
            return d.target.x;
          })
          .attr("y2", function (d) {
            return d.target.y;
          });

        node.attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      }
    });

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }, [data]); // Redraw chart if data changes

  return <svg ref={svgRef} width={svgWidth} height={svgHeight} />;
};

export default SpaceChart;
