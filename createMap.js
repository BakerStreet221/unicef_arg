// URL of the tile
var urlTile = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
// CopyLeft of the map
var mapAtribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';

// Create the map
var map = L.map('mapid',{
    // disable zoomControl when initializing map
    // (which is topleft by default)
}).setView([-33.12, -64.34], 4);

// Initialice the map
L.tileLayer(urlTile, {
    attribution: mapAtribution,
    maxZoom: 18
}).addTo(map);


// Add data to map
var dataUrl = "data/infoargentina_parte.geojson"
var data = new L.GeoJSON.AJAX(dataUrl, {
    style: style,
    onEachFeature: onEachFeature
});
data.addTo(map);


// Map info
var info = L.control();

info.onAdd = function (map) {
    // create a div with a class "info"
    this._div = L.DomUtil.create('div', 'info'); 
    this.update();
    return this._div;
};

// Method that we will use to update the control
// based on feature properties passed
info.update = function (props) {
    this._div.innerHTML =
	'Mostrar datos de: <input id="filterInput" />' +
	'<h4>Promedios </h4>' +
	(props ? '<b>' + props.name + '</b><br />' + props.density +
	 ' people / mi<sup>2</sup>'
         : 'Pone el mouse sobre alguna provincia');
};

// Add the info to map
info.addTo(map);


// Create the legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1000, 5000, 9000, 13000, 17000, 21000, 102000],
        labels = [];

    // loop through our density intervals and generate a
    // label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) +
	    '"></i> ' + grades[i] + (grades[i + 1] ? '&ndash;' +
				     grades[i + 1] + '<br>' : '+');
    }

    return div;
};

// Add legend to the map
legend.addTo(map);


// Listener of mouse move and click
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// On mouse over state, change the ifto text
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    
    info.update(layer.feature.properties);
}

// On mouse out of state, remove the info text
function resetHighlight(e) {
    data.resetStyle(e.target);
    info.update();
}

// Zoom to each state on click
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}


// State style
function getColor(d) {
    return d > 102000  ? '#800026' :
           d > 21000   ? '#BD0026' :
           d > 17000   ? '#E31A1C' :
           d > 13000   ? '#FC4E2A' :
           d > 9000   ? '#FD8D3C' :
           d > 5000   ? '#FEB24C' :
           d > 1000    ? '#FED976' :
                         '#FFEDA0';
}

function style(feature) {
    return {
        fillColor: getColor(feature.properties.density),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}


var input = document.getElementById("filterInput");
// Get the data and create the input button
var ajax = new XMLHttpRequest();
ajax.open("GET", "data/indicadores.json", true);
ajax.onload = function() {
    var list = eval(ajax.response);
    new Awesomplete(input, {list: list});
};
ajax.send();

