console.log("Assignment 5");

var margin = {t:50,r:100,b:50,l:50};
var width = document.getElementById('map').clientWidth - margin.r - margin.l,
    height = document.getElementById('map').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var map = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//TODO: set up a mercator projection, and a d3.geo.path() generator
//Center the projection at the center of Boston
var bostonLngLat = [-71.088066,42.315520]; //from http://itouchmap.com/latlong.html


//projection
var projection = d3.geo.mercator()
    .translate([width/2,height/2])
    .center(bostonLngLat)
    .scale(210000);

//path generator
var pathGenerator = d3.geo.path().projection(projection);

//TODO: create a d3.map() to store the value of median HH income per block group
var incomeByBlock = d3.map();

//TODO: create a color scale
var scaleColor = d3.scale.linear().domain([500,180000]).range(['orange','purple']);



//TODO: import data, parse, and draw
queue()
    .defer(d3.json, "data/bos_census_blk_group.geojson")//1
    .defer(d3.json, "data/bos_neighborhoods.geojson")//3
    .defer(d3.csv,"data/acs2013_median_hh_income.csv",parseData)//2
    .await(function(err, blocks, neighbor,income) {
        draw(blocks, neighbor,income); console.log(neighbor)
    })

//paraData
function parseData(d){
    incomeByBlock.set(d.geoid, +d.B19013001)
    console.log(name);

}

//draw the map
function draw (blocks, neighbor,income) {
    map .selectAll('.blocks')
        .attr('class', 'blocks')
        .data(blocks.features)
        .enter()
        .append("g")
        .append('path')
        .attr('d', pathGenerator)
        .style('fill', function (d) {

            var income = (incomeByBlock.get(d.properties.geoid));
            return scaleColor(income);

        })
        .call(attachTooltip)

   var mapb = map.selectAll('.neighbor')
        .data(neighbor.features)
        .enter()
        .append('g')
        .attr('class', 'neighbor');

    mapb.append('path')
        .attr('d', pathGenerator)
        .style("stroke", "white")
        .style("stroke-width", "1px")
        .style('fill',"none")
        .call(attachTooltipN);


    mapb.append('text')
        .text(function (d) {
            console.log(d)

            return d.properties.Name;
        })
        .attr("x", function (d) {
            return pathGenerator.centroid(d)[0];
        })
        .attr("y", function (d) {
            return pathGenerator.centroid(d)[1];
        })
        .style("fill",'black')
        .attr("text-anchor",'middle');
    //.attr('transform',function(d){
    //    return 'translate(' + pathGenerator(d.geoid) + ',' + ')';
}


function parseData(d) {
    incomeByBlock.set(d.geoid, +d.B19013001)

}

function attachTooltip(selection) {
    selection
        .on('mouseenter', function (d) {
            var tooltip = d3.select('.custom-tooltip');
            tooltip
                .transition()
                .style('opacity', 1);

            var income = (incomeByBlock.get(d.properties.geoid));
            console.log(income);
            tooltip.select('#income').html(income);

        })
        .on('mousemove', function () {
            var xy = d3.mouse(canvas.node());
            var tooltip = d3.select('.custom-tooltip');

            tooltip
                .style('left', xy[0] + 50 + 'px')
                .style('top', (xy[1] + 50) + 'px');

        })
        .on('mouseleave', function () {
            var tooltip = d3.select('.custom-tooltip')
                .transition()
                .style('opacity', 0);
        })
}
function attachTooltipN(selection) {
    selection
        .on('mouseenter', function (d) {
            var tooltip = d3.select('.custom-tooltip');
            tooltip
                .transition()
                .style('opacity', 1);

            tooltip.select('#name').html(d.properties.Name);
        })
}





