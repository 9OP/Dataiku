import React, { useMemo } from "react";
import * as d3 from "d3";
import { Route } from "./models/models";
import { ForceLink } from "d3";

const dimensions = {
  width: 400,
  height: 200,
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
};

type Dimension = typeof dimensions;

const SpaceChart = //  ({ data, dimensions }: { data: Data; dimensions: Dimension }) => {
  ({ routes }: { routes: Route[] }) => {
    const svgRef = React.useRef(null);
    const { width, height, margin } = dimensions;
    const svgWidth = width + margin.left + margin.right;
    const svgHeight = height + margin.top + margin.bottom;

    const nodes = useMemo(
      () =>
        [
          ...new Set<string>(
            routes.reduce(
              (acc, route) => acc.concat([route.origin, route.destination]),
              [] as string[]
            ) as string[]
          ),
        ].map((planet) => ({ id: planet })),
      [routes]
    );
    const links = useMemo(
      () =>
        routes.map((route) => ({
          source: route.origin,
          target: route.destination,
          travel_time: route.travel_time,
        })),
      [routes]
    );

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
          d3
            .forceLink()
            .id((d: any) => d.id)
            .distance(90)
        )
        .force("charge", d3.forceManyBody().strength(-100))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(20));

      svg
        .append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "-0 -5 10 10")
        .attr("refX", "13")
        .attr("refY", "0")
        .attr("orient", "auto")
        .attr("markerWidth", "5")
        .attr("markerHeight", "5")
        .attr("xoverflow", "visible")
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", "#4AF626")
        .style("stroke", "none");

      var link = svg
        .append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke-width", (d) => Math.sqrt(d.travel_time))
        .style("stroke", "#4AF626")
        .style("fill", "#4AF626")
        .attr("marker-end", "url(#arrowhead)");

      var node = svg
        .append("g")
        .attr("class", "nodes")
        .selectAll("g")
        .data(nodes)
        .enter()
        .append("g")
        .style("fill", "white");

      var circles = node.append("circle").attr("r", 4).style("fill", "#4AF626");

      // Create a drag handler and append it to the node object instead
      var drag_handler = d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

      drag_handler(node as any);

      node
        .append("text")
        .text((d) => d.id)
        .attr("x", 6)
        .attr("y", 6);
      link
        .append("text")
        .text((d) => "D:" + d.travel_time)
        .attr("dx", 6)
        .attr("dy", 6);

      simulation.nodes(nodes as any).on("tick", ticked);

      simulation.force<ForceLink<any, any>>("link")?.links(links);

      function ticked() {
        link
          .attr("x1", function (d: any) {
            return d.source.x;
          })
          .attr("y1", function (d: any) {
            return d.source.y;
          })
          .attr("x2", function (d: any) {
            return d.target.x;
          })
          .attr("y2", function (d: any) {
            return d.target.y;
          });

        node.attr("transform", function (d: any) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      }

      function dragstarted(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0.6).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: any) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: any) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }, [nodes, links, width, height]); // Redraw chart if data changes

    return <svg ref={svgRef} width={svgWidth} height={svgHeight} color="blue" />;
  };

export default SpaceChart;
