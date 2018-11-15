/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const categories = require('./category-count-dict.json');
const cors = require('cors');
const app = express();

app.set('case sensitive routing', true);
app.set('view engine', 'pug');
app.use(bodyParser.json());
app.use(cors());

const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

// check the config file
const config = require('./config.json');
if (config && typeof config.projectId !== 'undefined') {
  console.log('Project ID: ' + config.projectId);
} else {
  throw new Error('Error in config. Make sure to create a config.json file with { "projectId": "YOUR_PROJECT_ID", "bucketId": "YOUR_BUCKET_ID" }');
}

// Imports the Google Cloud client library
const Storage = require('@google-cloud/storage');
const storage = new Storage(config);

/* Note: "/drawing" in path because requests on the root path are currently rejected by the Extensible Service Proxy (ESP)

 See more here:
 https://cloud.google.com/endpoints/docs/openapi/openapi-limitations */

/**
 * '/drawing/:category/count'
 * Method: GET
 * Description: Get the number of drawings for a provided category
 * @param: {String} category [the name of the Quick, Draw! category (i.e. "cat")]
 */
app.get('/drawing/:category/count', asyncMiddleware(async (req, res, next) => {
  let category = req.params.category;
  if (typeof categories[category] !== 'undefined') {
    res.status(200).json(categories[category]).end();
  } else {
    res.sendStatus(404);
  }
}));

/**
 * '/drawing/:category'
 * Method: GET
 * Description: Gets the data for a random drawing
 * @param: {String} category [the name of the Quick, Draw! category (i.e. "cat")]
 * @queryParam: {String}  id          [the numerical id of a drawing]
 * @queryParam: {Boolean} isAnimated  [if the data includes time-based information for animating]
 * @queryParam: {String}  format      ["json" by default, can be "html" to return a rendering of the drawing on canvas]
 */
app.get('/drawing/:category', asyncMiddleware(async (req, res, next) => {
  const category = req.params.category;
  const isAnimated = req.query['isAnimated'] === 'true';
  const bucketDirectory = (isAnimated) ? 'drawings_raw_complete' : 'drawings_simplified_complete';
  let format = req.query['format'] || 'json';
  let id = req.query['id'];
  // if isn't animated, grab from bucket with simplified data (without time data)

  if (typeof categories[category] !== 'undefined') {
    // parse the ID query parameter
    // if not provided, give random number
    if (id && typeof id !== 'undefined') {
      id = parseInt(id, 10);
      if (isNaN(id)) {
        res.sendStatus(404);
      }
    } else {
      // ID not passed, assign random index
      let totalCount = categories[category];
      id = Math.floor(Math.random() * totalCount);
    }

    // download the file from GCS
    storage
      .bucket(config.bucketId)
      .file(`${bucketDirectory}/${category}/${id}.json`)
      .download()
      .then(results => {
        let obj = JSON.parse(results[0].toString());
        obj.index = id;
        obj.totalCategoryCount = categories[category];
        if (format.toLowerCase() === 'canvas' || format.toLowerCase() === 'html') {
          // send canvas drawing
          res.render('index', { title: 'Quick, Draw! ' + category, data: obj });
        } else {
          res.json(obj);
        }
      })
      .catch(err => {
        res.send(err);
      });
  } else {
    res.sendStatus(404);
  }
}));

if (module === require.main) {
  // [START listen]
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
  // [END listen]
}

module.exports = app;
