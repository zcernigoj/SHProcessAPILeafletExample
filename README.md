# Sentinel Hub APIs & Leaflet example

This is a simple example how to use Sentinel Hub Catalog API and Process API with Leaflet.js

- `getSHauthToken.js` contains code for requesting auth token.
- `getSHdates.js` contains code for requesting dates from Catalog API.
- `shLeafletLayer.js` contains code that extends Leaflet's GridLayer so that Process API can be used to get the images.

`CLIENT_ID` and `CLIENT_SECRET` must be set in `getSHauthToken.js` to make it work.

Example can be viewed by opening `index.html` in the browser.
