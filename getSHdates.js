async function getDates(authToken, bbox, fromTime, toTime, collection) {
  // The catalog responses are paginated (max 100 features / dates returned at once).
  // We need to make multiple requests, each one requesting another "page" of dates.  
  // - check if 'next' field is present in 'context' part of the response,
  // - if it's present, set the 'next' field in our payload to that value and make another request
  // - if it's not present, don't make any more requests

  try {
    let payload = {
      "bbox": bbox,
      "datetime": fromTime + "/" + toTime,
      "collections": [collection],
      "limit": 50,
      "distinct": "date",
    };
    let moreResults = true;
    let allDates = [];

    while (moreResults) {
      const response = await fetch("https://services.sentinel-hub.com/api/v1/catalog/search", {
        method: "post",
        headers: {
          Authorization: "Bearer " + authToken,
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.context.next) {
        moreResults = true;
        payload.next = data.context.next;
      } else {
        moreResults = false;
      }
      // Dates are returned in the 'features' part of the response.
      // They are ordered from the oldest to the newest date.
      allDates.push(...data.features);
    }

    return allDates;
  }
  catch (err) {
    console.error(err);
  }
}