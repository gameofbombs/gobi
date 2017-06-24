# Gobi
Typescript fork of [pixijs](https://github.com/pixijs/pixi.js)version 5. Re-uses code from pixi.js and its plugins.

The purpose is to add a number of complicated algorithms optimized for stages with ~10k objects on them.

The is that CPU usage is very low when only a few objects are moving and only GPU animations are enabled, and pixijs-level of CPU usage when all objects are going crazy.

Target platform: PC, both Intel and NVidia graphics cards.

Goals:
1. Fully-typed code for better experience with IDE: Intellij Idea (WebStorm) and Visual Studio (VSCode) 
2. No dependencies except TS/grunt. Even test framework will be included.
3. Double-pass with depth buffer for older graphic cards that do not like massive overdraw.
4. Cheap multi-quad model animations that work entirely on GPU
5. Cheap outline, glow and colormatrix filters
6. Pixel-perfect interaction
7. Support of both official pixi API over our Entity-Component model
8. Lazy updateTransform() that doesn't even iterate over elements that weren't changed
9. onAddedToStage, onRemovedFromStage events
10. Integrated support of [pixi-layers](https://github.com/pixijs/pixi-display/tree/layers), all layering and sorting operations are lazy too
11. Reduced texture memory usage through support of compressed textures, more options for texture cache
12. Realtime generation of texture atlases

Authors: @Busyrev and @ivanpopelyshev

## Usage

### Install

```bash
npm install
npm install -g typescript@2.4.1
npm install -g http-server
```

### Build and run

```
tsc
http-server -c-1
```

Open "localhost:8080/testPage.html" in your favorite browser.
