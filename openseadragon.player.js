/**
 * OpenSeadragon Player
 * v0.1
 */

var OpenSeadragonPlayer = OpenSeadragonPlayer || {};

// Common utilities
OpenSeadragonPlayer.utils: {
  // Generate a GUID-like random number
  generateUUID: function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  },
  // Create a namespaced HTML ID that is random enough
  // to be more or less unique
  makeID: function(prefix) {
    return prefix + "-" + OpenSeadragonPlayer.utils.generateUUID();
  },
  // Round a decimal number to a number of digits
  roundDecimal: function(num, digits) {
    if (digits <= 0) return num;
    var factor = (digits * 10),
    n = Math.round(num * factor),
    suf = (n % factor) / factor,
    pre = (n / factor) - suf;
    return pre + suf;
  }
};

// Default text for help description
OpenSeadragonPlayer.helpDesc = function(description){
  return description + " " +
    "Use arrow keys, or the W A S D keys, to scroll image. " +
    "Use plus and minus keys to zoom in and out. " + 
    "Press the zero key to reset pan and zoom.";
};

// Add accessibility layer
OpenSeadragonPlayer.addAccessLayer = function($, player, playerData){
  // Basic ARIA attributes, key overrides
  $(player.canvas).attr({
    tabindex: 0,
    'aria-live': 'polite' 
  })
  .keydown(function(e){
    e.stopPropagation();
  })
  .keyup(function(e){
    e.stopPropagation();
  });

  // Description
  var descID = OpenSeadragonPlayer.utils.makeID("openseadragon-player-desc"),
  desc = $('<div />', {
    'class': 'element-invisible',
    text: OpenSeadragonPlayer.helpDesc(playerData.description),
    id: descID
  }),
  descPosition = $('<span />', {
    'class': 'openseadragon-player-location'
  });
  desc.append(descPosition);
  $(player.canvas).prepend(desc).attr('aria-describedby', descID);

  // Events
  var descriptionText = null;
  var setDesc = function () {
    $(player.canvas.querySelector(".openseadragon-player-location")).text(descriptionText);
  };
  player.addHandler("pan", function(obj){
    descriptionText = "Panned to X coordinate " +
      Math.floor(obj.center.x * playerData.width) +
      " by Y coordinate " +
      Math.floor(obj.center.y * playerData.height) + ".";
    setDesc.debounce(500)();
  });
  player.addHandler("zoom", function(obj){
    descriptionText = "Zoomed to " +
      (obj.zoom == 1 ?
       "original size" :
       OpenSeadragonPlayer.utils.roundDecimal(obj.zoom, 2) + " times"
      ) + ".";
    setDesc.debounce(500)();
  });
  player.addHandler("home", function(obj){
    descriptionText = "Pan and zoom have both been reset.";
    setDesc.debounce(500)();
  });
};

// Creates a player from a compatible object
OpenSeadragonPlayer.makeDziPlayer = function($, playerParams, onReady){
  var osdParams = {
    id:                 playerParams.containerID,
    prefixUrl:          playerParams.osdAssets + "/images/",
    navigatorSizeRatio: 0.25,
    tileSources:        playerParams.baseURL
  };
  if (!!playerParams.navigator) {
    $.extend(osdParams, {
      showNavigator:   true,
      navigatorHeight: "100px",
      navigatorWidth:  "150px"
    });
  }
  var player = OpenSeadragon(osdParams),
  playerData = {
    width: 0,
    height: 0,
    description: playerParams.description
  };
  onReady($, player, playerData);
};

// Creates a player from a compatible object
OpenSeadragonPlayer.player = function($, playerSource, playerParams){
  playerSource($, playerParams, function($, player, playerData) {
    OpenSeadragonPlayer.addAccessLayer($, player, playerData);
  });
};

// Creates a player from a compatible object
OpenSeadragonPlayer.getFromLink = function($, link){
  if (!!link && !!$(link).attr('href')) {
    return {
      url:         $(link).attr('href'),
      description: $(link).text()
    };
  }
  return null;
};

// Prepares a container and returns its ID
OpenSeadragonPlayer.makeContainer = function($, prefix, toReplace, additionalClasses){
  if (!additionalClasses) additionalClasses = [];
  if (typeof additionalClasses === "string") additionalClasses = additionalClasses.split(" ");

  var dziContainerID = MivUtils.makeID(prefix);
  var containerOuter = $('<div />', {
    id:      dziContainerID + "-outer",
    'class': 'openseadragon-wrapper ' + additionalClasses.join(" ")
  });
  var containerInner = $('<div />', {
    id:      dziContainerID,
    'class': 'openseadragon-wrapper-inner'
  });
  containerInner.mousedown(function(e){
    e.stopPropagation();
  });
  containerOuter.append(containerInner);
  toReplace.replaceWith(containerOuter);
  return dziContainerID;
};