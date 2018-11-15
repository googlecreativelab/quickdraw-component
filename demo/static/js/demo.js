// set defaults
var count = 100,
  currentCategory = 'cat',
  elems = [];

(function(){
  // reference to quick draw component
  var qdEl = document.querySelector('quick-draw');

  // show the current index of the drawing loaded *when* it is loaded
  qdEl.addEventListener('drawingData', function(res){
    document.getElementById('drawing-id').innerHTML = numberWithCommas(res.detail.index) + ' / ' + numberWithCommas(categoriesDict[currentCategory]);
  })

  // populate the select drop down with all the categories
  var selectEl = document.getElementById('select-category');
  for(var i = 0; i < categories.length; i++){
    var option = document.createElement('option');
    var text = document.createTextNode(categories[i].category);
    option.appendChild(text);
    option.setAttribute('value', categories[i].category);
    selectEl.appendChild(option);
  }
  selectEl.value = 'cat';
  selectEl.addEventListener('change', onSelectCategory);

  document.querySelector('.refresh').addEventListener('click', function(){
    qdEl.index = -1;
    qdEl.refresh();
  })

  var colors = document.querySelectorAll('.colors li');
  [].forEach.call(colors, function(elem){
    elem.addEventListener('click', onSelectColor);
  })

  var timingOptions = document.querySelectorAll('.timing-options .timing-option');
  [].forEach.call(timingOptions, function(elem){
    elem.addEventListener('click', onSelectTiming);
  })
})()

function onSelectTiming(e){
  var timingId = e.target.dataset.id;
  var timingOptions = document.querySelectorAll('.timing-options .timing-option');
  [].forEach.call(timingOptions, function(elem){
    elem.classList.remove('selected');
    if(elem.dataset.id === timingId){
      elem.classList.add('selected');
    }
  })
  var html = '';
  var qdEl = document.querySelector('quick-draw');
  switch(timingId){
    case 'one-second':
      html = ' time="1000" animate';
      qdEl.animated = true;
      qdEl.time = 1000;
    break;
    
    case 'five-seconds':
      html = ' time="5000" animate';
      qdEl.animated = true;
      qdEl.time = 5000;
    break;
    
    case 'original':
      qdEl.animated = true;
      html = ' animate';
      qdEl.time = null;
    break;
    
    case 'no-animate':
      qdEl.animated = false;
      qdEl.time = null;
    break;
  }
  document.getElementById('timing').innerHTML = html;
}    

function onSelectColor(e){
  var newColor = e.target.dataset.color;
  var colors = document.querySelectorAll('.colors li');
  [].forEach.call(colors, function(elem){
    elem.classList.remove('selected');
    if(elem.dataset.color === newColor){
      elem.classList.add('selected');
    }
  })
  document.getElementById('stroke-color').innerHTML = newColor === '#000' ? '' : ` strokecolor="${newColor}"`;
  var qdEl = document.querySelector('quick-draw');
  qdEl.strokeColor = newColor;
}

function onSelectCategory(e){
  var selectEl = document.getElementById('select-category');
  var exampleValueEl = document.getElementById('example-value');
  var qdEl = document.querySelector('quick-draw');
  var newCat = selectEl.value;
  currentCategory = newCat;
  exampleValueEl.innerHTML = newCat;
  // qdEl.setAttribute('category', newCat);
  qdEl.category = newCat;
  // qdEl.setAttribute('category', newCat);
  // qdEl.fetchImageData(newCat);

}

function numberWithCommas(x){
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
