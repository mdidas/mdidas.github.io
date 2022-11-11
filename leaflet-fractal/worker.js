onmessage = function(e) {

    const setColor = function(imageData, x,y, r,g,b) {
        var idx = (x + y * imageData.width) * 4;

        imageData.data[idx] = r;
        imageData.data[idx+1] = g;
        imageData.data[idx+2] = b;
        imageData.data[idx+3] = 255;

        return imageData;
    }

    const calcRgbColor = function(i, r) {

        if (i <= 30) {
            return [ 0, 0, r*3 ];
        }
        else if (i <= 50) {
            return [ 0, r, r/3 ];
        }
        else if (i <= 70) {
            return [ r,r,r ];
        }
        else if (i <= 90) {
            return [ 2 * r, r, 0 ];
        }
        else if (i <= 120) {
            return [ r, 0, 0 ];
        }
        else if (i <= 140) {
            return [ r, r, r ];
        }
        else if (i <= 160) {
            return [ 0, 0, r * 3 ];
        }
        else if (i <= 180) {
            return [ 0, r, r/3 ];
        }
        else if (i <= 200) {
            return [ r, r, r ];
        }
        else if (i <= 250) {
            return [ 2 * r, r, 0 ];
        }
        else if (i <= 300) {
            return [ r, 0, 0 ];
        }
        else if (i <= 500) {
            return [ r, r, r ];
        }

    }

    var imageData = new ImageData(256, 256);

    var seed = [ 0.345, 0.396 ];

    var coords = e.data;

    var scale =  1 / Math.pow(2, coords.z);
    var u0 = coords.x * scale;
    var v0 = coords.y * scale;
    var step = scale;

    var iterationDepth = Math.max(150, 50 * (coords.z + 1));

    for(var x = 0; x < 256; x++) {
        for(var y = 0; y < 256; y++) {
            
            var u = u0 + x * scale / 256;
            var v = v0 + y * scale / 256;

            var u2 = 0;
            var v2 = 0;
            var uNext = 0;
            var r = 0;

            for(var i = 1; i < iterationDepth; i++) {
                u2 = u * u;
                v2 = v * v;
                uNext = u2 - v2 + seed[0];
                v = 2 * u * v + seed[1];
                u = uNext;

                if (u2 + v2 > 400)
                {
                    r = (10 * i) % 256;

                    imageData = setColor(imageData, x, y, ...calcRgbColor(i, r));
                    break;
                }
            }

            if (u2 + v2 <= 400)
            {
                imageData = setColor(imageData, x, y, 0,0,0);
            }
            
        }
    }

    postMessage(imageData);

}