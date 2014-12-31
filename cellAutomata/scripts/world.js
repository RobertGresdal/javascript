"use strict";
var self = this;

self.addEventListener("message", function(e) {
  //self.postMessage(e.data);
  var items = JSON.parse(e.data),
    item = null,
    i = 0,
    result = "";

  for (i = 0; item = items[i]; i++) {
    items[i] = Cell.tickAs(item);
  }

  result = JSON.stringify(items)
  self.postMessage(result);
}, false);
