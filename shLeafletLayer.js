// We need to extend Leaflet's GridLayer to add support for loading images through
// Sentinel Hub Process API:
L.GridLayer.SHProcessLayer = L.GridLayer.extend({
  createTile: function (coords, done) {
    const tile = L.DomUtil.create("img", "leaflet-tile");
    const tileSize = this.options.tileSize;
    tile.width = tileSize;
    tile.height = tileSize;
    const nwPoint = coords.multiplyBy(tileSize);
    const sePoint = nwPoint.add([tileSize, tileSize]);
    const nw = L.CRS.EPSG4326.project(
      this._map.unproject(nwPoint, coords.z)
    );
    const se = L.CRS.EPSG4326.project(
      this._map.unproject(sePoint, coords.z)
    );

    // Construct Process API request payload:
    //   https://docs.sentinel-hub.com/api/latest/reference/#tag/process
    const payload = {
      input: {
        bounds: {
          bbox: [nw.x, nw.y, se.x, se.y], // a tile's bounding box
          properties: {
            crs: "http://www.opengis.net/def/crs/EPSG/0/4326",
          },
        },
        data: [
          {
            dataFilter: {
              timeRange: { from: fromDate, to: toDate },
              maxCloudCoverage: 10,
              mosaickingOrder: "mostRecent",
            },
            processing: {},
            type: this.options.dataset,
          },
        ],
      },
      output: {
        width: 512,
        height: 512,
        responses: [
          {
            identifier: "default",
            format: { type: "image/png" },
          },
        ],
      },
      evalscript: this.options.evalscript,
    };

    // Fetch the image:
    fetch("https://services.sentinel-hub.com/api/v1/process", {
      method: "post",
      headers: {
        Authorization: "Bearer " + this.options.authToken,
        "Content-Type": "application/json",
        Accept: "*/*",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.blob())
      .then((blob) => {
        const objectURL = URL.createObjectURL(blob);
        tile.onload = () => {
          URL.revokeObjectURL(objectURL);
          done(null, tile);
        };
        tile.src = objectURL;
      })
      .catch((err) => done(err, null));

    return tile;
  },
});

L.gridLayer.shProcessLayer = function (opts) {
  console.log('opts', { opts });
  return new L.GridLayer.SHProcessLayer(opts);
};