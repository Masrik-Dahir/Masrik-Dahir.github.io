
    const iconFeature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([-77.434769, 37.541290])),
    name: 'Somewhere near Nottingham',
});

    const iconFeature2 = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([-76.598633, 39.264969])),
    name: 'Somewhere near Nottingham',
});

    const iconFeature3 = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([-75.500000, 39])),
    name: 'Somewhere near Nottingham',
});

    const map = new ol.Map({
    target: 'map',
    layers: [
    new ol.layer.Tile({
    source: new ol.source.OSM(),
}),
    new ol.layer.Vector({
    source: new ol.source.Vector({
    features: [iconFeature, iconFeature2, iconFeature3],
}),


    style: new ol.style.Style({
    image: new ol.style.Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: './Images/pin.png',
})
})
})
    ],
    view: new ol.View({
    center: ol.proj.fromLonLat([-78.024902, 37.926868]),
    zoom: 5,
    maxZoom: 7,
    minZoom: 3,
})

});
    // map.addOverlay(overlayLayer);
    // const overlayFeatureName = document.getElementsById('feature-name')
    // const overlayFeatureAdditionalInfo = document.getElementsById('feature-additional-info')
    //
    // map.on('click', function(e){
    //     // overlayLayer.setPosition(undefined)
    //     map.forEachFeatureAtPixel(e.pixel, function(feature, layer){
    //         let clickedCoordinate = e.coordinate;
    //         let clickedFeatureName = feature.get('name');
    //         let clickedFeatureAdditionInfo = feature.get('additionalinfo');
    //         // overlayLayer.setPosition(clickedCoordinate)
    //         overlayFeatureName.innerHTML = clickedFeatureName;
    //         overlayFeatureAdditionalInfo.innerHTML = clickedFeatureAdditionInfo;
    //         console.log(clickedFeatureName, clickedFeatureAdditionInfo);
    //     })
    // })

