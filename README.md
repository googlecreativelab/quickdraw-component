![logos for Quick, Draw! and the Polymer Project and Google Cloud](https://github.com/googlecreativelab/quickdraw-component/raw/master/images/header.png "Quick, Draw! + Polymer Project + Google Cloud")
## Quick, Draw! Polymer Component & API

Embed [Quick, Draw!](https://quickdraw.withgoogle.com/) drawings into your project using a web component, as easily as:

```<quick-draw category="apple" key="API_KEY"></quick-draw>```  

This component is built using [Polymer3](https://www.polymer-project.org/) and is coupled with an API layer for accessing individual drawing data from the [open sourced data set](https://github.com/googlecreativelab/quickdraw-dataset).  The drawings are drawn out to a canvas element, and provides you with options to customize it for your own web project. [Here's a demo of how it can be used in different ways.](https://googlecreativelab.github.io/quickdraw-component/demo/)

### Background

In October 2016 we released [Quick, Draw!](https://quickdraw.withgoogle.com), a game to test your ability to doodle and have a nueural net guess what you're drawing. You can help teach it by adding your drawings to the world’s largest doodling data set, shared publicly to help with machine learning research. 

Since the release, we've collected over 1 billion drawings across 345 categories. We've [released the data](https://github.com/googlecreativelab/quickdraw-dataset) in the form of [very large ndjson files](https://pantheon.corp.google.com/storage/browser/quickdraw_dataset/full/raw) of moderated doodles. Now we are releasing a data API, a Polymer web component, and an option to self-host the 50 million files.

## Run example

With npm installed, in the root of this repo:

```
npm install
npm start
```

When this works, you'll see this simple demo of the component:

![demo image](https://github.com/googlecreativelab/quickdraw-component/raw/master/images/demo.png)


## Usage

Install as an NPM dependency to your project:

```
npm install --save quickdraw-component
```

Import it:

```
import 'quickdraw-component/quickdraw-component.js';
```

*You need to make sure that your app is using a tool like [Webpack](https://webpack.js.org/concepts/configuration/) or [Rollup](https://rollupjs.org/guide/en) to transpile and bundle the component into your app.*

The most basic usage of the component's properties is to include a static, random drawing of a category with an API Key:

```<quick-draw category="apple" key="AIzaSyC0U3yLy_m6u7aOMi9YJL2w1vWG4oI5mj0"></quick-draw>```

A list of all the available categories is [here](./categories.js).

### Getting a demo API Key

It is *highly encouraged* for any large project to not use the demo endpoint as a dependency - see [Self-Hosting](#self-hosting) below.  In order to get an API key for the demo endpoint, you need to:

1. [Join the Quick Draw API Google Group](https://groups.google.com/forum/#!forum/quick-draw-data-api).

2. In your project on Google Cloud Platform, go to [APIs & Services > Library](https://pantheon.corp.google.com/apis/library) and search for "Quick, Draw! API"

3. Click into Quick, Draw! Data API and press "Enable"

4. If you haven't created an API Key yet for your project, go into [APIs & Services > Credentials](https://pantheon.corp.google.com/apis/credentials) and create one.  This is what you'll use in the `key` property of: `<quick-draw key="YOUR_API_KEY"></quick-draw>`


### Options

| Name		     | Description | Type		  | Default | Options / Examples|
| :----------- | :-----------:| :-----------:| :-----------:|---------:|
| `category` **required* | One of the [available categories](./categories.js) | String | null | ```<quick-draw category="apple"></quick-draw>```
| `key` **required* | API Key from Google Cloud Platform | String | null | ```<quick-draw key="AIzaSyC0U3yLy_m6u7aOMi9YJL2w1vWG4oI5mj0"></quick-draw>```
| `host` | The host of your API | String | https://quickdrawfiles.appspot.com | ```<quick-draw host="https://quickdrawfiles.appspot.com"></quick-draw>```
| `index` | The drawing id within a category *(random unless specified)* | Number | -1 | ```<quick-draw category="apple" index="3927"></quick-draw>```
| `animate` | Animate the drawing in the same time frame it was originally drawn|  Boolean | *false* |`<quick-draw category="apple" animate></quick-draw>`
| `time` | Sets the total time for the animation, preserving time proportions for each path (in milliseconds)|  Number | null |`<quick-draw category="apple" time="1500" animate></quick-draw>`
| `paused` | When set to true, the component will only load the image data but not draw it. Listen for the data loaded event ```drawingData``` and then call ```drawImage()``` to control it manually|  Number | null |`<quick-draw category="apple" paused animate></quick-draw>`
| `strokeColor` | A hex value for the stroke color |  String | #000000 |`<quick-draw category="apple" strokeColor="#4285f4"></quick-draw>`
| `strokeWidth` | The width/thickness of the stroke |  Number | 4|`<quick-draw category="apple" strokeWidth="1"></quick-draw>`
| `width` | The px width of the drawing. If provided, the drawing will scale proportionally to fit the space. |  String | 'auto'|`<quick-draw category="apple" width="125"></quick-draw>`
| `height` | The px height of the drawing. If provided, the drawing will scale proportionally to fit the space. |  String | 'auto'|`<quick-draw category="apple" height="125"></quick-draw>`
| `debug` | For testing purposes, will log output |  Boolean | false|`<quick-draw category="apple" debug></quick-draw>`


### Events

You can listen for the following custom events from the component:

| Name		    | Description	 | Return       |
| ----------- | :-----------:| :-----------:|
| `drawingData` | When drawing data is received | `{detail: {index, category, data}}`
| `drawingComplete` | When drawing is completed | `{detail: {index, category, data}}`

An example of how to access the element to listen for events:

```
function ready() {
	var el = document.querySelector('quick-draw');
	el.addEventListener('drawingData', function(){
	  console.log('Drawing data loaded...');
	});
	el.addEventListener('drawingComplete', function(){
	  console.log('Drawing complete!');
	});
}
	
document.addEventListener("DOMContentLoaded", ready);
```

### Methods

You can manually call the following methods on your element:

#### fetchImageData(category, index)
This method will load image data, where "category" is one of [these available categories](./categories.js) like "cat", or "apple", and index is the number of the drawing.  If index isn't passed, then it will load in a random image. To find out exactly how many indices are available for a given category, use the ```/{category}/count``` API call below.  

#### drawImage()
This method will simply draw the image out on the canvas with its current properties.  This is especially useful when using the ```paused``` property (when you want to control exactly when it's drawn out).


## API / Middleware

This component has a server-side dependency, which can be reached from this endpoint:

```https://quickdrawfiles.appspot.com/drawing/{category}?id={id}&key={key}&isAnimated={isAnimated}&format={format}```

| Name		     | Description | Type		  | Default |
| :----------- | :-----------:| :-----------:| -----------:|
| `category` **required* | One of the [available categories](./categories.js) | String | null
| `id` **required* | ID (number) or "random" | String | null
| `key` **required* | API Key ([see above for instructions](#getting-a-demo-api-key)) | String | null
| `isAnimated` | Will return raw time-based data if true, otherwise simplified data | Boolean | false 
| `format` | JSON or canvas drawing | String | "json"

You can also retrieve the total count of drawings within a category using:

```https://quickdrawfiles.appspot.com/drawing/{category}/count?key={key}```


## Self-Hosting

It's highly encouraged that you self-host for larger, more serious projects as the quota limits are subject to change with this one (and it's not gauranteed to be supported / maintained forever).  View the [README.md](./api/README.md) in the API directory to learn more about how to self-host the files and the API.

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

The component & API fall under the Apache 2.0 license.


