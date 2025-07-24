# KAPLAY ATB Plugin
A KAPLAY plugin to create active time bar!

Install
```
npm i kaplay-atb-plugin
```

## Usage
Import the plugin into your kaplay game.
```
import kaplay from "kaplay";
import ATB from 'kaplay-atb-plugin'

const k = kaplay({
    width: 800,
    height: 600,
    plugins: [ATB],
});

const atb = k.createATB(3, 200, 20, { x: 100, y: 100 }, () => { console.log("ATB filled!"), { outline: 4 } });
```

To pause or resume the bar.
```
atb.pause()
```

By default. The bar will be destroyed when it is filled. If you wish to end it early.
```
atb.remove()
```

Since both the wrapper and bar are GameObj. It is easy to expand it by adding components or change param value.
```
// Add text to the center of the bar
atb.bar.add([
    k.text('Flexible ATB', { size: 16, font: "monospace", width: atb.bar.width, align: 'center' }),
])

// Change outline color
atb.wrapper.outline.color = k.color(200, 150, 200).color
```

## Parameters
* time - Number of seconds for the ATB to fill
* width - Width of the ATB bar
* height - Height of the ATB bar
* pos - Position of the ATB bar in the game world
* action - Things to do when the ATB bar is filled
* options - Optional parameters for customizing the ATB bar

## Options
* wrapperColor - Optional color for the wrapper of the ATB bar in rgb format
* barColor - Optional color for the ATB bar in rgb format
* radious - A number to set radius for the corners of the ATB bar (default: null)
* reverse - If true, the bar will go in reverse order (from right to left)
* outline - A number to set the width of outline (default  : null)
* stay - If true, the bar will stay on the screen after filling (default: false)

### P.S
Just in case if you need to change the color with option reverse set to true.
Please noted that the color for both wrapper and bar are swapped to simulate the effect.

