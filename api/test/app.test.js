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
const path = require('path');
const proxyquire = require('proxyquire').noPreserveCache();
const request = require('supertest');
const sinon = require('sinon');
const test = require('ava');
const tools = require('@google-cloud/nodejs-repo-tools');
const sampleCat = require('./cat.json');

const SAMPLE_PATH = path.join(__dirname, '../app.js');

function getSample () {
  const testApp = express();
  sinon.stub(testApp, 'listen').callsArg(1);
  const expressMock = sinon.stub().returns(testApp);

  const app = proxyquire(SAMPLE_PATH, {
    express: expressMock
  });
  return {
    app: app,
    mocks: {
      express: expressMock
    }
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test('lookup number of apples', async t => {
  t.plan(2);
  const res = await request(getSample().app)
    .get('/drawing/apple/count');

  t.is(res.status, 200);
  t.is(res.text, '139902');
});

test('lookup non-existent category', async t => {
  t.plan(1);
  const res = await request(getSample().app)
    .get('/drawing/frankenstein/count');

  t.is(res.status, 404);
});

test('test isAnimated=true query parameter for drawing data', async t => {
  t.plan(1);
  const res = await request(getSample().app)
    .get('/drawing/apple?isAnimated=true');

  t.is(JSON.parse(res.text).drawing[0].length, 3);
});

test('test isAnimated=false query parameter for drawing data', async t => {
  t.plan(1);
  const res = await request(getSample().app)
    .get('/drawing/apple?isAnimated=false');

  t.is(JSON.parse(res.text).drawing[0].length, 2);
});

test('test specific cat ID=9 data', async t => {
  t.plan(1);
  const res = await request(getSample().app)
    .get('/drawing/cat?format=json&isAnimated=true&id=9');
  t.deepEqual(JSON.parse(res.text), sampleCat);
});
