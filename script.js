// US Education Data:https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json
// US County Data:https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json

"use strict";

function chartMap(us, education) {
  /////////////////////////////////////////////////////
  //my classic margins and variable setup for these projects
  /////////////////////////////////////////////////////

  const width = 800;

  const body = d3.select("body");
  const svg = d3.select("svg");
  const path = d3.geoPath();
  const edVariance = education.map((ed) => {
    return ed.bachelorsOrHigher;
  });
  const myColor = d3
    .scaleSequential()
    .interpolator(d3.interpolateGnBu)
    .domain([d3.min(edVariance), d3.max(edVariance)]);

  /////////////////////////////////////////////////////
  //Adding the tooltip and mouseover
  /////////////////////////////////////////////////////
  const tooltip = d3
    .select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

  const mouseOver = function (d) {
    tooltip.style("opacity", 1);

    d3.select(this).style("opacity", 0.5).style("stroke", "black");
  };

  const mouseMove = function (d, data) {
    tooltip
      .html((d) => {
        let res = education.filter((obj) => {
          return obj.fips === data.id;
        });
        if (res[0]) {
          return `${res[0].area_name}, ${res[0].state} <br>Bachelors or higher: ${res[0].bachelorsOrHigher}&#37;`;
        }
        return 0;
      })
      .style("left", d3.pointer(d)[0] + 170 + "px")
      .style("top", d3.pointer(d)[1] + "px")
      .attr("data-education", (d) => {
        let res = education.filter((obj) => {
          return obj.fips === data.id;
        });
        if (res[0]) {
          return res[0].bachelorsOrHigher;
        }
        return 0;
      });
  };

  const mouseLeave = function (d) {
    tooltip.style("opacity", 0);

    d3.selectAll(".county").style("opacity", 1).style("stroke", "transparent");
  };

  /////////////////////////////////////////////////////
  //Adding the map with its colored counties
  /////////////////////////////////////////////////////

  svg
    .append("g")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")

    .attr("class", "county")
    .attr("data-fips", (d) => d.id)
    .attr("data-education", (d) => {
      let res = education.filter((obj) => {
        return obj.fips === d.id;
      });
      if (res[0]) {
        return res[0].bachelorsOrHigher;
      }
      return 0;
    })
    .attr("fill", (d) => {
      let res = education.filter((obj) => {
        return obj.fips === d.id;
      });

      if (res[0]) {
        return myColor(res[0].bachelorsOrHigher);
      }
      return myColor(0);
    })
    .attr("d", path)
    .on("mouseover", mouseOver)
    .on("mousemove", mouseMove)
    .on("mouseleave", mouseLeave);

  /////////////////////////////////////////////////////
  //legend
  /////////////////////////////////////////////////////

  const legend = d3
    .legendColor()
    .orient("horizontal")
    .scale(myColor)
    .shapePadding(20)
    .ascending(false)
    .title("Percentage with Bachelor's")
    .labelAlign("middle");
  svg
    .append("g")
    .attr("position", "absolute")
    .attr("id", "legend")
    .attr("transform", `translate(${width - 130},40)`)
    .call(legend);
}

///////////////////////////////////
//get data and run main function
///////////////////////////////////
async function fetchData() {
  const res1 = await fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  );
  const res2 = await fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  );
  const data1 = await res1.json(); //education data
  const data2 = await res2.json(); //map coords

  const education = data1;
  const usMap = data2;
  chartMap(usMap, education);
}
fetchData();
