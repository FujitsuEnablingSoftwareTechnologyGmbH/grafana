/* global _ */

/*
 * Complex scripted dashboard
 * This script generates a dashboard object that Grafana can load. It also takes a number of user
 * supplied URL parameters (int ARGS variable)
 *
 * Return a dashboard object, or a function
 *
 * For async scripts, return a function, this function must take a single callback function as argument,
 * call this callback function with the dashboard object (look at scripted_async.js for an example)
 */

'use strict';

// accessable variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;

// Setup some variables
var dashboard, timspan;

// All url parameters are available via the ARGS object
var ARGS;

// Set a default timespan if one isn't specified
timspan = '1d';

// Intialize a skeleton with nothing but a rows array and service object
dashboard = {
  rows : [],
};

// Set a title
dashboard.title = 'Alarm drilldown';
dashboard.time = {
  from: "now-" + (ARGS.from || timspan),
  to: "now"
};

var rows = 1;
var seriesName = 'argName';
var threshold = null;

if(!_.isUndefined(ARGS.rows)) {
  rows = parseInt(ARGS.rows, 10);
}

if(!_.isUndefined(ARGS.name)) {
  seriesName = ARGS.name;
}

if(!_.isUndefined(ARGS.threshold)) {
  threshold = ARGS.threshold;
}

for (var i = 0; i < rows; i++) {

  dashboard.rows.push({
    title: 'Chart',
    height: '300px',
    panels: [
      {
        title: seriesName,
        type: 'graph',
        span: 12,
        fill: 1,
        linewidth: 2,
        targets: [
            {
              "function": "avg",
              "column": "value",
              "series": seriesName
            }
        ],
        grid: {
            threshold1: threshold,
        },
      }
    ]
  });
}


return dashboard;
