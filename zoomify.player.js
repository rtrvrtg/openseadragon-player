/**
 * OpenSeadragon Player
 * v0.1
 */

var ZoomifyOpenSeadragon = ZoomifyOpenSeadragon || {};

// Defines a single zoom level
ZoomifyOpenSeadragon.ZoomifyLevel = function(width, height, tileSize){
  if (!tileSize) tileSize = 256;
  this.tileSize = tileSize;
  this.width = width;
  this.height = height;
  this.xTiles = Math.ceil(this.width / this.tileSize);
  this.yTiles = Math.ceil(this.height / this.tileSize);

  this.length = function(){
    return this.xTiles * this.yTiles;
  };
  this.tiles = function(){
    return this.length;
  };
};

// Defines a zoomify pyramid
ZoomifyOpenSeadragon.ZoomifyPyramid = function(width, height, tileSize){
  if (!tileSize) tileSize = 256;
  this.tileSize = tileSize;
  this.width = width;
  this.height = height;

  this.pyramid = [];
  var level = new ZoomifyOpenSeadragon.ZoomifyLevel(width, height, tileSize);
  while (level.width > this.tileSize || level.height > this.tileSize) {
    this.pyramid.push(level);
    level = new ZoomifyOpenSeadragon.ZoomifyLevel(level.width / 2, level.height / 2, tileSize);
  }
  this.pyramid.push(level);
  this.pyramid.reverse();

  this.getLevel = function(level) {
    return this.pyramid[level];
  };
  this.levels = function(){
    return this.pyramid.length;
  };
};


// Defines an entire image
ZoomifyOpenSeadragon.ZoomifyImage = function(width, height, tileSize, baseURI){
  this.tileSize = tileSize;
  this.width = width;
  this.height = height;
  this.baseURI = baseURI;
  this.pyramid = new ZoomifyOpenSeadragon.ZoomifyPyramid(width, height, tileSize);

  this.tilesUpToLevel = function(level) {
    var tiles = 0;
    for (var i = 0; i < level; i++) {
      tiles += parseInt(this.pyramid.getLevel(i).length(), 0);
    }
    return tiles;
  };
  this.tiles = function() {
    return this.tilesUpToLevel(this.pyramid.levels());
  };
  this.getTileIndex = function(level, x, y) {
    return (
      x +
          (y * this.pyramid.getLevel(level).xTiles) +
          this.tilesUpToLevel(level)
        );
  };
  this.getTileURI = function(level, x, y){
    var rawTIX = this.getTileIndex(level, x, y),
    tgi = Math.floor(rawTIX / 256);
    return this.baseURI + '/' +
      'TileGroup' + tgi +
      '/' + [
        level,
        x,
        y
      ].join('-') + '.jpg';
  };
  this.levels = function(){
    return this.pyramid.levels();
  };
};

// Default text for help description
ZoomifyOpenSeadragon.helpDesc = function(){
  return "Zoomable visual content. " +
    "Use arrow keys, or the W A S D keys, to scroll image. " +
    "Use plus and minus keys to zoom in and out. " + 
    "Press the zero key to reset pan and zoom.";
};

// Creates a Zoomify player from a compatible object
ZoomifyOpenSeadragon.makeZoomifyPlayer = function($, playerParams, onReady){
  var dataReceived = function(raw){
    var width = parseInt(raw.documentElement.getAttribute('WIDTH'), 10)
    height    = parseInt(raw.documentElement.getAttribute('HEIGHT'), 10),
    tileSize  = parseInt(raw.documentElement.getAttribute('TILESIZE'), 10);

    // Initialise ZoomifyOSD
    var zfi = new ZoomifyOpenSeadragon.ZoomifyImage(
      width,
      height,
      tileSize,
      playerParams.baseURL.replace(/ImageProperties\.xml$/, "")
    );

    // Initialise OpenSeadragon
    var player = OpenSeadragon({
        id:            playerParams.containerID,
        prefixUrl:     playerParams.osdAssets + "/images/",
        navigatorSizeRatio: 0.25,
        wrapHorizontal:     false,
        tileSources:   {
            height: zfi.height,
            width:  zfi.width,
            tileSize: zfi.tileSize,
            minLevel: 0,
            maxLevel: zfi.levels() - 1,
            getTileUrl: function(level, x, y){
              return zfi.getTileURI(level, x, y);
            }
        }
    }),
    playerData = {
      width: zfi.width,
      height: zfi.height,
      description: playerParams.description
    };

    onReady($, player, playerData);
  };
  $.ajax({
    url: playerParams.baseURL,
    success: dataReceived,
    dataType: 'xml'
  });
};
