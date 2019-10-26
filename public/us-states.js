const map = L.map('map').setView([37.8, -96], 4);

function loadStatesData(cb) {
  const req = new XMLHttpRequest();
  req.overrideMimeType('application/json');
  req.open('GET', 'statesData.json', true);
  req.onreadystatechange = function () {
    if (req.readyState === 4 && req.status === 200) {
      // Required use of an anonymous callback
      // as .open() will NOT return a value but simply returns undefined in asynchronous mode
      cb(req.responseText);
    }
  };
  req.send(null);
}

function mapLogic(statesData) {
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light', 		// id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoiZHRjMiIsImEiOiJjajM0bGhtdWMwMXMyMndvOTNhMTV5bGlwIn0.P982OmG7OY8ETeL971l1Ww'
  }).addTo(map);

  L.geoJSON(statesData).addTo(map);

  function getColor(d) {
    return d > 1000 ? '#800026' :
      d > 500 ? '#BD0026' :
        d > 200 ? '#E31A1C' :
          d > 100 ? '#FC4E2A' :
            d > 50 ? '#FD8D3C' :
              d > 20 ? '#FEB24C' :
                d > 10 ? '#FED976' :
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

  L.geoJson(statesData, { style: style }).addTo(map);

  function highlightFeature(e) {
    const layer = e.target;
    info.update(layer.feature.properties);

    layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }
  }

  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
  }


  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: zoomToFeature
    });
  }

  const geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
  }).addTo(map);


  const info = L.control();

  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info.update = function (props) {
    this._div.innerHTML = '<h4>US Population Density</h4>' + (props ?
      '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>'
      : 'Hover over a state');
  };

  info.addTo(map);


  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {

    const div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 10, 20, 50, 100, 200, 500, 1000],
      labels = [];
    let i;
    for (i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(map);
}

function main() {
  loadStatesData(function(statesData) {
    mapLogic(JSON.parse(statesData));
  });
}

main();
