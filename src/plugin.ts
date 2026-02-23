import type { GameObj, TimerController, KAPLAYCtx, DrawTextOpt, TextCompOpt, Color } from "kaplay";

export interface ATBBar {
    wrapper: GameObj | null;
    bar: GameObj | null;
    controller: TimerController | customTimeController;
    pause: Function;
    remove: Function;
}

type direction = 'horizontal'|'vertical'
type mode = 'dynamic'|'static'

interface customTimeController {
    paused: boolean,
    cancel: () => void
}

/**
 * @param parent - Optional. If set, the bar will be the child of the GameObj. If the mode set to static, the bar will be draw with the onDraw event of the GameObj. 
 * @param wrapperColor - Optional color for the wrapper of the ATB bar in rgb format
 * @param barColor - Optional color for the ATB bar in rgb format
 * @param radius - Optional radius for the corners of the ATB bar
 * @param outline - If true, the bar will have an outline
 * @param reverse - If true, the bar will go in reverse order (from right to left)
 * @param direction - Support horizontal and vertical.
 */
interface ATBOptions{
    parent?: GameObj
    wrapperColor?: Color;
    barColor?: Color;
    radius?: number;
    outline?: { width: number, color?: Color };
    reverse?: boolean;
    stay?: boolean;
    direction?: direction
    mode?: mode,
    text?: {
        text: string,
        color: Color,
        anchor: 'left'|'center'|'right'
    } | TextCompOpt | DrawTextOpt
}

const drawStaticBar = (
    k: KAPLAYCtx, 
    width: number, 
    height: number, 
    time: number, 
    pos: { x: number, y: number },
    percentage: number, 
    wColor: Color,
    bColor: Color,
    controller: customTimeController,
    direction?: ATBOptions['direction'],
    radius?: ATBOptions['radius'],
    reverse?: ATBOptions['reverse'],
    outline?: ATBOptions['outline']
) => {
    // Draw wrapper
    k.drawRect({
        width,
        height,
        pos: k.vec2(pos.x, pos.y),
        color: wColor,
        radius: radius?? 0,
        outline: {
            width: outline?.width,
            color: outline?.color?
                outline.color:
                wColor
        }
    })   

    // Stop updating bar width or height
    if(!controller.paused){
        const add = 1/time
        percentage = (percentage + add > 1)? 1 : percentage + add
    }

    // Draw inner bar
    if(direction === 'vertical'){
        const newHeight =  height * percentage
        k.drawRect({
            width,
            height: newHeight,
            pos: k.vec2(reverse? pos.x + width : pos.x, pos.y),
            color: bColor,
            radius: radius?? 0,
        })
    }else{
        const newWidth =  width * percentage
        k.drawRect({
            width: newWidth,
            height,
            pos: k.vec2(reverse? pos.x + width : pos.x, pos.y),
            color: bColor,
            radius: radius?? 0,
        })        
    }       

    return percentage
}

export default function ATB(k: KAPLAYCtx) {

    return {
        /**
         * Creates an ATB (Active Time Battle) bar.
         * @param time - Number of seconds for the ATB to fill
         * @param width - Width of the ATB bar
         * @param height - Height of the ATB bar
         * @param pos - Position of the ATB bar in the game world
         * @param action - Function to call when the ATB bar is filled
         * @param options - Optional parameters for customizing the ATB bar
         * @param options.parent - If set, the bar will be the child of the GameObj. If the mode set to static, the bar will be draw with the onDraw event of the GameObj. 
         * @param options.wrapperColor - Color of the wrapper in rgb format (default: k.rgb(0, 0, 0))
         * @param options.barColor - Color of the ATB bar in rgb format (default: k.rgb(10, 130, 180))
         * @param options.radius - A number to set radius for the corners of the ATB bar (default: null)
         * @param options.outline - A number to set the weight of outline (default  : null)
         * @param options.reverse - If true, the bar will fill in reverse order (default: false)
         * @param options.stay - If true, the bar will stay on the screen after filling (default: false)
         * @param options.direction - The default horizontal. Set to vertical if you wish to animate the bar height.
         * @param options.mode - The default is dynamic. Set to static if you have no need to manipulate the bar further more. Which means the bar will render with onDraw event.
         * @param options.text - Support TextCompOpt or DrawTextOpt from Kaplay. The minimum params as list below.
            * @param options.text.text - The text to display.
            * @param options.text.color
         * @returns - An object containing the wrapper, bar, and controller for the ATB bar
         */
        createATB(
            time: number, 
            width: number, 
            height: number, 
            pos: { x: number, y: number },
            action: Function,
            options: ATBOptions = {
                radius: -1,
                outline: {
                    width: 0,
                    color: undefined
                },
                direction: 'horizontal',
                mode: 'dynamic'
            }
        ) {
            let { parent, wrapperColor, barColor, radius, outline, reverse, stay, direction, mode } = options;

            let wColor = wrapperColor?? k.rgb(0, 0, 0);
            let bColor = barColor?? k.rgb(10, 130, 180);
            
            let percentage = 0

            direction = direction?? 'horizontal'
            mode = mode?? 'dynamic'

            if(mode === 'static'){
                time = time * 60 // Frame      

                // Cancel state
                let cancel = false
                
                const controller: customTimeController = {
                    paused: false,
                    cancel: () => {
                        console.log('faking cancel')
                        cancel = true
                        percentage = 0
                    }
                }                

                if(parent){
                    parent.onDraw(() => {
                        if(cancel) return
                        percentage = drawStaticBar(
                            k,
                            width,
                            height,
                            time,
                            pos,
                            percentage,
                            wColor,
                            bColor,
                            controller,
                            direction,
                            radius,
                            reverse,
                            outline
                        )
                    })
                }else{
                    k.onDraw(() => {
                        if(cancel) return
                        percentage = drawStaticBar(
                            k,
                            width,
                            height,
                            time,
                            pos,
                            percentage,
                            wColor,
                            bColor,
                            controller,
                            direction,
                            radius,
                            reverse,
                            outline
                        )
                    })
                }

                return {
                    wrapper: null,
                    bar: null,
                    controller,
                    pause(this) {
                        this.controller.paused = !this.controller.paused;
                    },
                    remove(this) {
                        this.controller.cancel();
                    }
                } as ATBBar;   
            }else{
                time = time * 10

                let wrapper: GameObj

                if(parent){
                    wrapper = parent.add([
                        k.area(),
                        k.rect(width, height),
                        k.pos(pos.x, pos.y),       
                        k.color(wColor),  
                        (outline?.width)?
                            k.outline(
                                outline.width, 
                                (outline.color)? 
                                    outline.color :
                                    wColor
                            ) :
                            "none"      
                    ])
                }else{
                    wrapper = k.add([
                        k.area(),
                        k.rect(width, height),
                        k.pos(pos.x, pos.y),       
                        k.color(wColor),  
                        (outline?.width)?
                            k.outline(
                                outline.width, 
                                (outline.color)? 
                                    outline.color :
                                    wColor
                            ) :
                            "none"      
                    ])                   
                }

                const barWidth = outline?.width? width - outline.width : width
                const barHeight = outline?.width? height - outline.width : height

                const bar = wrapper.add([
                    k.rect(barWidth, barHeight),
                    k.pos(
                        outline?.width? 0 + (outline.width / 2) : 0, 
                        outline?.width? 
                            direction === 'vertical' && reverse?
                                0 + (outline.width / 2) + barHeight :
                                0 + (outline.width / 2) : 0
                    ),       
                    k.color(bColor),
                    direction === 'vertical'? 
                        reverse? 
                            k.anchor('botleft') : k.anchor('topleft'):
                    direction === 'horizontal'?
                        reverse?
                            k.anchor('topright') : k.anchor('topleft') : k.anchor('topleft')
                ])  
                
                if(radius && radius > 0) {
                    wrapper.radius = radius;
                    bar.radius = radius;
                }
                
                const controller = k.loop(0.1, () => {
                    const add = Math.floor(100/time)
                    percentage = (percentage + add > 100)? 100 : percentage + add

                    if(direction === 'vertical'){
                        const newHeight =  barHeight * (percentage/100)
                        k.tween(bar.height, newHeight, 0, (p) => bar.height = p, k.easings.linear)
                    }else{
                        const newWidth =  barWidth * (percentage/100)
                        k.tween(bar.width, newWidth, 0, (p) => bar.width = p, k.easings.linear)
                    }
                }, time)
                    
                controller.onEnd(() => {
                    action()
                    if(!stay){
                        wrapper.destroy()
                        bar.destroy()                    
                    }
                }) 

                return {
                    wrapper,
                    bar,
                    controller,
                    pause(this) {
                        this.controller.paused = !this.controller.paused;
                    },
                    remove(this) {
                        this.controller.cancel();
                        this.wrapper?.destroy();
                        this.bar?.destroy();
                    }
                } as ATBBar;             
            }
        }
    };
}
