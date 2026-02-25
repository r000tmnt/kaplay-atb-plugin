# KAPLAY ATB Plugin
A KAPLAY plugin to create active time bar!

Install
```
npm i kaplay-atb-plugin
```

### New features in v0.3.0_k3001
* Support vertical bars.
* Support to display bars with onDraw event.
* Support to create bars as child of existing GameObj.

### Breaking changes
* Color params needs to be kaplay Color class.
* Param <code>reverse</code> will set the anchor to the opposite side instead of swap color order.
* Param <code>outline</code> is an object. It needs to have <code>width</code> to work properly.

## Usage
Import the plugin into your kaplay game.
```Javascript
import kaplay from "kaplay";
import ATB from 'kaplay-atb-plugin'

const k = kaplay({
    width: 800,
    height: 600,
    plugins: [ATB],
});

const atb = k.createATB(
    3, 
    200, 
    20, 
    { x: 100, y: 100 }, 
    () => { console.log("ATB filled!"), 
    { 
        outline: { 
            width: 4 
        } 
    } 
});
```

To pause or resume the bar.
```Javascript
atb.pause()
```

By default. The bar will be destroyed when it is filled. If you wish to end it early.
```Javascript
atb.remove()
```

In dynamic mode. Both the wrapper and bar are GameObj. It is easy to expand it by adding components or change param value.
In case of static mode. Both wrapper and bar becomes unreachable. For they are drawn with onDraw event. The <code>pause()</code> and <code>remove()</code> still works though.
```Javascript
// Add text to the center of the bar
atb.bar.add([
    k.text('Flexible ATB', { size: 16, font: "monospace", width: atb.bar.width, align: 'center' }),
])

// Change outline color
atb.wrapper.outline.color = k.color(200, 150, 200).color
```

## Parameters
| Name    | Description                                               |
| ---     | ---                                                       |
| time    | Number of seconds for the ATB bar to fill.                |
| width   | Width of the ATB bar.                                     |
| height  | Height of the ATB bar.                                    |
| pos     | Position of the ATB bar in the game world.                |
| action  | A callback function to invoke when the ATB bar is filled. |
| options | Optional parameters for customizing the ATB bar.          |

## Options
| Name         | Description                                             | Default                 |
| ---          | ---                                                     | ---                     |
| parent       | The parent of ATB bar. Accepts GameObj only.            | None                    | 
| wrapperColor | Color of the wrapper in rgb format.                     | `k.rgb(0, 0, 0)`      |
| barColor     | Color of the ATB bar in rgb format.                     | `k.rgb(10, 130, 180)` |
| radius       | A number to set radius for the corners of the ATB bar.  | 0                       |
| reverse      | If true, the bar will go in reverse order.              | None                    |
| stay         | If true, the bar will stay on the screen after filling. | None                    |
| mode         | Decide how the plugin display the bar. Set to `static` if you have no need to manipulate the bar further more. | `dynamic` |
| outline | The outline of the bar. If set, it will create a border around the bar with the specified width and color. <table> <tr> <th>Param</th> <th>Description</th> <th>Default</th> </tr> <tr> <td>width</td> <td>The width of the outline in pixels.</td> <td>None</td> </tr> <tr> <td>color</td> <td>The color of the outline in rgb format.</td> <td>Same as the wrapperColor</td> </tr> </table> | None |
| text | The minimum set of params to display text on the bar. It will create a sprite from the text and aligned based on the direction of the bar and the anchor point. <table> <tr> <th>Param</th> <th>Description</th> <th>Default</th> </tr> <tr> <td>text</td> <td>The text to display.</td> <td>None</td> </tr> <tr> <td>color</td> <td>The color of the text.</td> <td>`k.rgb(255, 255, 255)`</td> </tr> <tr> <td>anchor</td> <td>The anchor of the text.</td> <td>`center`</td> </tr> </table> | None |


<!-- ### Outline params
<table> <tr> <th>Param</th> <th>Description</th> <th>Default</th> </tr> <tr> <td>width</td> <td>The width of the outline in pixels.</td> <td>None</td> </tr> <tr> <td>color</td> <td>The color of the outline in rgb format.</td> <td>Same as the wrapperColor</td> </tr> </table> -->

<!-- ### Text params
<table> <tr> <th>Param</th> <th>Description</th> <th>Default</th> </tr> <tr> <td>text</td> <td>The text to display.</td> <td>None</td> </tr> <tr> <td>color</td> <td>The color of the text.</td> <td>`k.rgb(255, 255, 255)`</td> </tr> <tr> <td>anchor</td> <td>The anchor of the text.</td> <td>`center`</td> </tr> </table> -->


