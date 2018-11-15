// Copyright 2018 Google LLC

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     https://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import {LitElement, html} from '@polymer/lit-element';
import { categories } from './categories';

// temporary deferring update until connectedCallback
// see more: https://github.com/Polymer/lit-element/issues/258
const DeferUntilConnected = superClass => class extends superClass {
  _invalidate(){
    if (this._hasConnected){
      super._invalidate();
    }
  }
  connectedCallback() {
    this._hasConnected = true;
    super.connectedCallback();
    this.requestUpdate();
  }
}

const QuickDrawElement = DeferUntilConnected(class extends LitElement {

  // Public property API that triggers re-render (synced with attributes)
  static get properties() {
    return {
      category: {type: String},
      speed: {type: Number},
      strokeWidth: {type: Number},
      strokeColor: {type: String},
      width: {type: String},
      height: {type: String},
      key: {type: String},
      host: {type: String},
      index: {type: Number},
      animated: {type: Boolean},
      debug: {type: Boolean},
      time: {type: Number},
      paused: {type: Boolean}
    }
  }

  // set default properties
  constructor() {
    super();
    this.category = null;
    this.key = null;
    this.index = -1;
    this.width = 'auto';
    this.height = 'auto';
    this.strokeWidth = 4;
    this.strokeColor = '#000000';
    this.speed = 0.5;
    this.host = 'https://quickdrawfiles.appspot.com';
    this.imageData = null;
    this.animated = false;
    this.debug = false;
    this.time = null; // ms
    this.paused = false;
    this._isFetching = false;
  }

  // runs only once after first render()
  firstUpdated(){
     // get references
    this.canvas = this.shadowRoot.querySelector('#canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  // when properties are updated
  updated(changedProperties){
    // do property checks
    if(!this.key){
      console.error('No API Key provided.')
      return;
    } 
    if(!this.category){
      console.error('No category provided.')
      return;
    }
    if(this._isFetching){
      console.warn('Tried to change property while fetch is still in flight.'); 
      return;
    }
    // draw to canvas, fetching new data if necessary
    this._init(changedProperties.has('category') || changedProperties.has('index') || changedProperties.has('animated'));
  }

  async _init(isNewFetch){
    // cancel anything that is currently going on
    if(this.cancelDrawing){
      if(this.reqFrame){
        window.cancelAnimationFrame(this.reqFrame);
      }
      this.cancelDrawing();
      this.cancelDrawing = null;
    }
    // clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // load image data
    if(isNewFetch){
      try{
        this._log('Fetching new data...');
        this._isFetching = true;
        this.imageData = await this.fetchImageData(this.category, this.index);
        this._isFetching = false;
      }catch(err){
        console.error(err);
        return;
      }
    }
    // draw new image
    if(!this.paused){
      try{
        await this.drawImage();
      }catch(err){
        this._log('Drawing stopped short.');
      }
      this.lastIndex = 0;
    }
  }

  refresh(){
    this._init(true);
  }

  async fetchImageData(category, index){
    let filepath = this.host + `/drawing/${category}?isAnimated=${this.animated}&key=${this.key}`
    if(typeof index != 'undefined' && parseInt(index, 10) >= 0){
      filepath += `&id=${index}`;
    }
    // fetch local file
    try{
      const res = await fetch(filepath);
      if(res.status == 404){
        this._log('Could not find file: ' + filepath);
      }else{
        try{
          const resJson = await res.json()
          this._log('id -> ' + resJson.index);
          const data = {detail: {index: resJson.index, category: this.category, data: resJson}};
          this.imageData = data.detail.data;
          this.dispatchEvent(new CustomEvent('drawingData', data))
          return resJson;
        }catch(err){
          throw err;
        }
      }
    }catch(err){
      throw err;
    }
  }

  async drawImage(){
    if(!this.imageData){
      console.error('drawImage() called before drawing data has loaded.');
      return;
    }
    const imageData = this.imageData.drawing;
    // make sure canvas is cleared
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);  
    // call this method when canceling before finished
    this.cancelDrawing = () => { 
      if(this.promisePathCancel){
        this.promisePathCancel();
        this.promisePathCancel = null;
      }
    }
    // get image properties
    // {x_range, y_range, width, height, x, y}
    this.currentImageProperties = this._getDrawingProperties(imageData);
    // account for stroke width to the image properties
    this.currentImageProperties.width += this.strokeWidth * 2;
    this.currentImageProperties.height += this.strokeWidth * 2;
    this.currentImageScaleRatio = 1;
    // default, automatic width and height based on original drawing
    if(this.width == 'auto' && this.height == 'auto'){
      this.canvas.width = this.currentImageProperties.width;
      this.canvas.height = this.currentImageProperties.height;
    }
    // user gave height value, width is auto
    else if(this.width == 'auto' && this.height != 'auto'){
      this.canvas.height = parseInt(this.height, 10);
      let ratio = this.height / this.currentImageProperties.height;
      this.currentImageScaleRatio = ratio;
      this.canvas.width = this.currentImageProperties.width * ratio;
    }
    // user gave width value, height is auto
    else if(this.width != 'auto' && this.height == 'auto'){
      this.canvas.width = parseInt(this.width, 10);
      let ratio = this.width / this.currentImageProperties.width;
      this.currentImageScaleRatio = ratio;
      this.canvas.height = this.currentImageProperties.height * ratio; 
    }
    // user provided both width and height
    else{
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      // let's best fit the drawing in the user-defined canvas dimensions
      const destWidth = this.width;
      const destHeight = this.height;
      const sourceWidth = this.currentImageProperties.width;
      const sourceHeight = this.currentImageProperties.height;
      // Determine the appropriate scale
      const scaleX = destWidth / sourceWidth;
      const scaleY = destHeight / sourceHeight;
      this.currentImageScaleRatio = scaleX < scaleY ? scaleX : scaleY;
    }

    // lose decimal precision, using floor & 90% of original value to give slight padding
    // eg: 0.3463203463203463 -> 0.31
    this.currentImageScaleRatio = Math.floor((this.currentImageScaleRatio * 0.9) * 100) / 100;

    // need to get time ratios for each path, used when user sets time
    // first get total time for drawing
    if(this.animated){
      let total = imageData[imageData.length - 1][2][imageData[imageData.length - 1][2].length - 1];
      // add ratios to path data
      for(let i = 0; i < imageData.length; i++){
        const ttc = imageData[i][2][imageData[i][2].length - 1];
        imageData[i].push(ttc / total);
      }
      this._log(`Original time: ${total}ms`, '#9f8029');
      this._log(`New time: ${this.time}ms`, '#9f8029');
    }
    // loop through each segment and draw
    let timeToCompleteThisPath = 0,
      timeToCompleteLastPath = 0;
    for(let i = 0; i < imageData.length; i++){
      if(this.animated){
        if(this.time){
          timeToCompleteThisPath = imageData[i][3] * this.time;
        }else{
          timeToCompleteThisPath = imageData[i][2][imageData[i][2].length - 1];
        }
        if(i > 0){
          if(this.time){
            timeToCompleteLastPath = imageData[i - 1][3] * this.time;
          }else{
            timeToCompleteLastPath = imageData[i - 1][2][imageData[i - 1][2].length - 1];
          }
          timeToCompleteThisPath -= timeToCompleteLastPath;
        }
      }
      this._log(`Path ${i + 1}/${imageData.length} time: ${timeToCompleteThisPath}ms`, '#e2b537');
      try{
        await this._drawSegment(imageData[i], timeToCompleteThisPath);
      }catch(err){
        throw 'Segment drawing cut short.'
      }
      this.promisePathCancel = null;
      this.lastIndex = 0;
    }
    this.dispatchEvent(new CustomEvent('drawingComplete', {detail: {index: this.imageData.index, category: this.category, data: this.imageData}}))
  }

  _drawSegment(points, timeToComplete){
    return new Promise((resolve, reject) => {
      if(this.animated){
        // for canceling the drawing of segment before finished
        this.promisePathCancel = () => { 
          reject();
        }
        // assuming 60 FPS
        let totalFrames = Math.floor((timeToComplete / 1000) * 60);
        this._refreshLoop(points, totalFrames, 0, resolve);
      }else{
        this.lastIndex = this._drawPath(points, (this.lastIndex || 0), 1);
        resolve();
      }
    })
  }

  _refreshLoop(points, totalFrames, counter, resolve) {
    let that = this;
    this.reqFrame = window.requestAnimationFrame(() => {
      let ratioComplete = counter / totalFrames;
      that.lastIndex = that._drawPath(points, (that.lastIndex || 0), ratioComplete);
      if(counter >= totalFrames){
        window.cancelAnimationFrame(that.reqFrame);
        resolve();
      }else{
        counter++;
        that._refreshLoop(points, totalFrames, counter, resolve);
      }
    });
  }


  _drawPath(points, startIndex, ratioComplete){
    let x_points = points[0],
      y_points = points[1],
      stroke_len = x_points.length, // number of x & y points in stroke
      ratio_complete_len = Math.floor(ratioComplete * stroke_len),
      len = Math.min(ratio_complete_len, x_points.length);

    this.ctx.beginPath();
    this.ctx.lineWidth = this.strokeWidth;
    this.ctx.strokeStyle = this.strokeColor;
    // gives smoother rendering
    // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Applying_styles_and_colors#A_lineJoin_example
    this.ctx.lineJoin = this.ctx.lineCap = 'round';

    let {x, y} = this._transformPoint(x_points[startIndex], y_points[startIndex]);
    this.ctx.moveTo(x, y);
    for(let j = startIndex; j < len; j++){
      let {x, y} = this._transformPoint(x_points[j], y_points[j]);
      
      if(j > 0){
        // Note: tried using quadraticCurveTo as a smoothing effect but found
        // normal lineTo with a round line cap yielded smoother results
        this.ctx.lineTo(x, y);
      }
    }
    this.ctx.stroke();
    return len - 1;
  }

  _transformPoint(x, y){
    x = (x - this.currentImageProperties.x) * this.currentImageScaleRatio + this.strokeWidth;
    y = (y - this.currentImageProperties.y) * this.currentImageScaleRatio + this.strokeWidth;
    return {x: x, y: y};
  }

  _getDrawingProperties(points){
    let x_range = {min: 99999, max: 0},
      y_range = {min: 99999, max: 0};
    for(let i = 0; i < points.length; i++){
      let stroke_len = points[i][0].length;
      for(let j = 0; j < stroke_len; j++){
        let this_x = points[i][0][j],
          this_y = points[i][1][j];
        if(this_x < x_range.min) x_range.min = this_x;
        else if(this_x > x_range.max) x_range.max = this_x;
        if(this_y < y_range.min) y_range.min = this_y;
        else if(this_y > y_range.max) y_range.max = this_y;
      }
    }
    return {
      x_range: x_range, 
      y_range: y_range, 
      width: x_range.max - x_range.min, 
      height: y_range.max - y_range.min,
      x: x_range.min,
      y: y_range.min
    };
  }

  _logProperties(){
    if(this.debug){
      console.log('Properties:::');
      console.log(
      '\tthis.category:',this.category,'\n',
      '\tthis.key:',this.key,'\n',
      '\tthis.index:',this.index,'\n',
      '\tthis.width:',this.width,'\n',
      '\tthis.height:',this.height,'\n',
      '\tthis.strokeWidth:',this.strokeWidth,'\n',
      '\tthis.strokeColor:',this.strokeColor,'\n',
      '\tthis.speed:',this.speed,'\n',
      '\tthis.host:',this.host,'\n',
      '\tthis.imageData:',this.imageData,'\n',
      '\tthis.animated:',this.animated,'\n',
      '\tthis.debug:',this.debug,'\n',
      '\tthis.time:',this.time,'\n',
      '\tthis.pause:',this.paused,'\n'
      ) 
    }
  }

  _log(s, color){
    if(this.debug){
      console.log('%c Quick, Draw! Component ::: ' + '%c' + s, "color:#ffd139;", `color:${color || '#000'};`);
    }
  }

  // Render method should return a `TemplateResult` using the provided lit-html `html` tag function
  render() {

    return html`
      <style>
        :host {
          display: block;
        }
        :host([hidden]) {
          display: none;
        }
      </style>
      <canvas id="canvas">${this.category}</canvas>
    `;
  }
});

customElements.define('quick-draw', QuickDrawElement);