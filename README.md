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

const atb = k.createATB(3, 200, 20, { x: 100, y: 100 }, () => { console.log("ATB filled!") });
```

To pause or resume the bar.
```
atb.pause()
```

By default. The bar will be destroyed when it is filled. If you wish to end it early.
```
atb.remove()
```

## Parameters
* time - Number of seconds for the ATB to fill
* width - Width of the ATB bar
* height - Height of the ATB bar
* pos - Position of the ATB bar in the game world
* action - Things to do when the ATB bar is filled
* wrapperColor - Optional color for the wrapper of the ATB bar in rgb format
* barColor - Optional color for the ATB bar in rgb format
* reverse - If true, the bar will go in reverse order (from right to left)
