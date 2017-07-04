function Autocomplete(input, url) {
  this.input = input;
  this.url = url;

  this.listUI = null;
  this.overlay = null;

  this.wrapInput();
  this.createUI();
  this.bindEvents();
  this.valueChanged = debounce(this.valueChanged.bind(this), 300);

  this.reset();
}

Autocomplete.prototype.bindEvents = function() {
  this.input.addEventListener('input', this.handleInput.bind(this));
  this.input.addEventListener('keydown', this.handleKeydown.bind(this));
  this.listUI.addEventListener('mousedown', this.handleMousedown.bind(this));
};

Autocomplete.prototype.wrapInput = function() {
  var wrapper = document.createElement('div');
  wrapper.classList.add('autocomplete-wrapper');
  this.input.parentNode.appendChild(wrapper);
  wrapper.appendChild(this.input);
};

Autocomplete.prototype.createUI = function() {
  var listUI = document.createElement('ul');
  listUI.classList.add('autocomplete-ui');
  this.input.parentNode.appendChild(listUI);
  this.listUI = listUI;

  var overlay = document.createElement('div');
  overlay.classList.add('autocomplete-overlay');
  overlay.style.width = this.input.clientWidth + 'px';

  this.input.parentNode.appendChild(overlay);
  this.overlay = overlay;
};

Autocomplete.prototype.draw = function() {
  var child;
  while (child = this.listUI.lastChild) {
    this.listUI.removeChild(child);
  }

  if (!this.visible) {
    this.overlay.textContent = '';
    return;
  }

  if (this.bestMatchIndex !== null) {
    var selected = this.matches[this.bestMatchIndex];
    this.overlay.textContent = this.generateOverlayContent(this.input.value, selected);
  } else {
    this.overlay.textContent = '';
  }

  this.matches.forEach(function(match, index) {
    var li = document.createElement('li');
    li.classList.add('autocomplete-ui-choice');
    if (index === this.selectedIndex) {
      li.classList.add('selected');
      this.input.value = match.name;
    }
    li.textContent = match.name;
    this.listUI.appendChild(li);
  }.bind(this));
};

Autocomplete.prototype.generateOverlayContent = function(value, match) {
  if (!match) {
    return '';
  }

  var end = match.name.substr(value.length);
  return value + end;
};

Autocomplete.prototype.fetchMaches = function(query, callback) {
  var request = new XMLHttpRequest();

  request.addEventListener('load', function() {
    callback(request.response);
  }.bind(this));

  request.open('GET', this.url + encodeURIComponent(query));
  request.responseType = 'json';
  request.send();
};

Autocomplete.prototype.handleKeydown = function(event) {
  switch(event.key) {
    case 'Tab':
      if (this.bestMatchIndex !== null) {
        this.input.value = this.matches[this.bestMatchIndex].name;
        event.preventDefault();
      }
      this.reset();
      break;
    case 'Enter':
      this.reset();
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (this.selectedIndex === null || this.selectedIndex === 0) {
        this.selectedIndex = this.matches.length - 1;
      } else {
        this.selectedIndex -= 1;
      }
      this.bestMatchIndex = null;
      this.draw();
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (this.selectedIndex === null || this.selectedIndex === this.matches.length - 1) {
        this.selectedIndex = 0;
      } else {
        this.selectedIndex += 1;
      }
      this.bestMatchIndex = null;
      this.draw();
      break;
    case 'Escape': // escape
      this.input.value = this.previousValue;
      this.reset();
      break;
  }
};

Autocomplete.prototype.handleMousedown = function(event) {
  event.preventDefault();

  var element = event.target;
  if (element.classList.contains('autocomplete-ui-choice')) {
    this.input.value = element.textContent;
    this.reset();
  }
};

Autocomplete.prototype.reset = function(event) {
  this.visible = false;
  this.matches = [];
  this.selectedIndex = null;
  this.previousValue = null;
  this.bestMatchIndex = null;
  this.draw();
};

Autocomplete.prototype.handleInput = function(e) {
  this.overlay.textContent = '';
  this.valueChanged();
}

Autocomplete.prototype.valueChanged = function() {
  var value = this.input.value;
  this.previousValue = value;
  if (value.length > 0) {
    this.fetchMaches(value, function(matches) {
      this.visible = true;
      this.matches = matches;
      this.selectedIndex = null;
      this.bestMatchIndex = 0;
      this.draw();
    }.bind(this));
  } else {
    this.reset();
  }
};
// type letter
// - display matches
// - show top match in overlay
// - arrows change selected match
// tab
// - fills input with top choice and retains focus
// tab
// - blurs and focuses next input

// type letter
// - display matches
// arrow down
// - select first choice
// - input value becomes selected choice
// return
// - closes menu, retains input value

// type letter
// - display matches
// arrow down
// - select first choice
// - input value becomes selected choice
// escape
// - reverts to value that was entered

// type letter
// - display matches
// use mouse to hover over choices
// - background of hovered choice should change
// - click choice
// - input value becomes clicked choice
// - input retains focus
// - menu closes

// type letter
// - display matches
// press delete
// - overlay text hides immediately
// - choices reload if the value isn't empty
