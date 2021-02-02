# React Image Annotate

[![npm version](https://badge.fury.io/js/react-image-annotate.svg)](https://badge.fury.io/js/react-image-annotate)

The best image/video annotation tool ever. [Check out the demo here](https://universaldatatool.github.io/react-image-annotate/). Or the [code sandbox here](https://codesandbox.io/s/react-image-annotate-example-38tsc?file=/src/App.js:0-403).

## Sponsors

[![wao.ai sponsorship image](https://s3.amazonaws.com/asset.workaround.online/sponsorship-banner-1.png)](https://wao.ai)

## Features

- Simple input/output format
- Bounding Box
- Zooming, Scaling, Panning
- Multiple Images
- Cursor Crosshair

![Screenshot of Annotator](https://user-images.githubusercontent.com/1910070/51199716-83c72080-18c5-11e9-837c-c3a89c8caef4.png)

## Usage

`npm install react-image-annotate`

```javascript
import React from "react";
import ReactImageAnnotate from "react-image-annotate";

const App = () => (
  <ReactImageAnnotate
    labelImages
    regionClsList={["Alpha", "Beta", "Charlie", "Delta"]}
    images={[
      {
        id: "11111",
        src: "https://placekitten.com/408/287",
        name: "Image 1",
        regions: []
      }
    ]}
  />
);

export default App;

```

To get the proper fonts, make sure to import the Inter UI or Roboto font, the
following line added to a css file should suffice.

```css
@import url("https://rsms.me/inter/inter.css");
```

## Props

All of the following properties can be defined on the Annotator...

| Prop                     | Type (\* = required)                             | Description                                                                             | Default       |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------- | ------------- |
| `taskDescription`        | \*`string`                                       | Markdown description for what to do in the image.                                       |               |
| `allowedArea`            | `{ x: number, y: number, w: number, h: number }` | Area that is available for annotation.                                                  | Entire image. |
| `regionClsList`          | `Array<string>`                                  | Allowed "classes" (mutually exclusive classifications) for regions.                     |               |
| `enabledTools`           | `Array<string>`                                  | Tools allowed to be used. e.g. "select", "pan", "zoom", "show-tags", "create-box", "show-tags" | Everything.   |
| `showTags`               | `boolean`                                        | Show tags and allow tags on regions.                                                    | `true`        |
| `selectedImage`          | `string`                                         | URL/id of initially selected image.                                                        |               |
| `images`                 | `Array<Image>`                                   | Array of images to load into annotator                                                  |               |
| `onExit`                 | `MainLayoutState => any`                         | Called when "Save" is called.                                                           |               |
| `RegionEditLabel`        | `Node`                                           | React Node overriding the form to update the region (see [`RegionLabel`](https://github.com/waoai/react-image-annotate/blob/master/src/RegionLabel/index.js))                                                          |               |

## Developers

### Development

To begin developing run the following commands in the cloned repo.

1. `yarn install`

### Icons

Consult these icon repositories:

- [Material Icons](https://material.io/tools/icons/)
- [Font Awesome Icons](https://fontawesome.com/icons?d=gallery&m=free)
