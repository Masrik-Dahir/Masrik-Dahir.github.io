window.onload = init;
function init(){
    const map = new ol.map({
        view: new ol.View({
            center: ol.proj.fromLonLat([-78.024902, 37.926868]),
            zoom: 4,
            maxZoom: 10,
            minZoom: 4,
            rotation: 0.5
        }),
        target: 'js-map'
    })

//    Basemaps Layers
    const openStreetMapStandard = new ol.layer.Tile({
        source: new ol.source.OSM(),
        visible: true,
        title: 'OSMStandard'
    })
}