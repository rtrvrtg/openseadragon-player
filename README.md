# OpenSeadragon Player

Enhancements for OpenSeadragon and a common API for alternative tilesets

## Authorship

Written by [Geoffrey Roberts](mailto:g.roberts@blackicemedia.com)

## License

MIT

## Features

* Accessibility enhancements
* Support for alternative tilesets
  * Zoomify tilesets supported

## Requirements

* OpenSeadragon
* jQuery

## Installation

In the `<head>` of your page, after you set up your jQuery and OpenSeadragon `<script>` items, add the following:

```html
<script type="text/javascript" src="openseadragon.player.js"></script>
```

If you want Zoomify tileset support, add the following:

```html
<script type="text/javascript" src="zoomify.player.js"></script>
```

## Usage

To use the OpenSeadragon player, you need to create a container for it to exist in.

Assuming you have a HTML element on the page called `elem` in your script, use the following to set a container up:

```javascript
var containerID = OpenSeadragonPlayer.makeContainer(
  $,
  "openseadragon-dzi-container",
  $(elem)
);
```

Then, run the following to start the player:

```javascript
OpenSeadragonPlayer.player(
  $,
  OpenSeadragonPlayer.makeDziPlayer,
  {
    containerID: containerID,
    baseURL:     urlToDZIFolder,
    osdAssets:   'url/for/openseadragon/assets',
    description: 'description of image content',
    navigator:   true
  }
);
```

The same works for Zoomify tilesets, you just need to specify the right player function and URL:

```javascript
OpenSeadragonPlayer.player(
  $,
  ZoomifyOpenSeadragon.makeZoomifyPlayer,
  {
    containerID: containerID,
    baseURL:     urlToZoomifyFolder + "ImageProperties.xml",
    osdAssets:   'url/for/openseadragon/assets',
    description: 'description of image content',
    navigator:   true
  }
);
```

*Note:* the server of the URL you are accessing must either be the same as the site you're running OpenSeadragon from, or it must use Cross-Origin Resource Sharing ([CORS](http://enable-cors.org)).

### Helper functions

If you're integrating OpenSeadragon Player with other systems and need an easy way to get a description and URL in one go, use the following function:

```javascript
OpenSeadragonPlayer.getFromLink($, link)
```

If you pass it a valid link, it returns an object containing `url` and `description` parameters, based on the text content and `href` attribute of the link.

## Changelog

### v0.1

Initial commit