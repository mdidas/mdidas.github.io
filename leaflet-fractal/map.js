// describe a leaflet grid layer for painting fractal tiles
L.GridLayer.FractalTiles = L.GridLayer.extend({

    createTile: function (coords, done) {
    
        // create canvas element and set properties
        const tile = L.DomUtil.create('canvas');
        const size = this.getTileSize();

        tile.width = size.x;
        tile.height = size.y;
        tile.style.outline = '1px dashed black';

        // create web worker calculating the canvas image data
        const worker = new Worker('worker.js');
        
        // if worker responds: put image data into canvas
        worker.onmessage = (e) => {
            tile.getContext('2d').putImageData(e.data, 0, 0);
            done(null, tile);
        }

        // start worker with coords passed to createTile
        worker.postMessage(coords);

        return tile;
    }
});

// create a leaflet map and add the above layer
const map = L.map('map', { crs: L.CRS.Simple, center: [ 0, 0 ], zoom: 0 });
const fractalGridLayer = (options) => new L.GridLayer.FractalTiles(options);
fractalGridLayer({ tileSize: 256 }).addTo(map);
