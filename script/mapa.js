var w = 1300
var h = 700
var svg = d3.select("#container").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .style("background-color", "#0E90AD")
    .attr("viewBox", "0 0 " + w + " " + h)
    .classed("svg-content", true)

var projection = d3.geoMercator().translate([w / 2, h / 3]).scale(250).center([0, 40])
var path = d3.geoPath().projection(projection)

// load data  
var worldmap = d3.json("/data/world.geojson")
var cities = d3.csv("/data/possessoes_imperio.csv")

const g = svg.append('g')

Promise.all([worldmap, cities]).then(function (values) {
    // draw map
    g.selectAll("path")
        .data(values[0].features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .append('title')
        .attr("class", "country_name")
        .text(d => d.properties.NAME_ENGL)

    // draw points
    g.selectAll("circle")
        .data(values[1])
        .enter()
        .append("circle")
        .attr("class", "circles")
        .attr("cx", function (d) { return projection([d.Longitude, d.Latitude])[0] })
        .attr("cy", function (d) { return projection([d.Longitude, d.Latitude])[1] })
        .attr("r", "3px")
        .append('title')
        .attr("class", "location_name")
        .text(d => d.Local)

    svg.call(d3.zoom().on('zoom', function (event) {
        g.attr('transform', event.transform)
    }
    ))
})

var state = {
    origincity: 'Lisboa'
}

const territories = cities.then(function (d) {
    return Promise.all(d.map(function (results) {
        return [results.Local];
    }))
});

territories.then(function (d) {
    d3.select("#menu .origin-city select")
        .selectAll('option')
        .data(d)
        .enter()
        .append('option')
        .attr('value', function (d) { return d })
        .text(function (d) { return d })

    d3.select("#menu .destiny-city select")
        .selectAll('option')
        .data(d)
        .enter()
        .append('option')
        .attr('value', function (d) { return d })
        .text(function (d) { return d })
})

d3.select("#menu .origin-city select")
    .on("change", highlight_city)

d3.select("#menu .destiny-city select")
    .on("change", highlight_city)

function highlight_city() {
    var orig = document.getElementById("origincity")
    var origin_city = orig.options[orig.selectedIndex].value
    var dest = document.getElementById("destinycity")
    var destiny_city = dest.options[dest.selectedIndex].value
    d3.selectAll(".circles")
        .style("fill", function (d) {
            var text = d.Local
            if (text !== origin_city && (text !== destiny_city)) {
                return "#3c373d"
            } else {
                return "red"
            }
        })
}