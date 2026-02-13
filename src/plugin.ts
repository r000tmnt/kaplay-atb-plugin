import type { GameObj, TimerController, KAPLAYCtx } from "kaplay";

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
    wrapperColor?: number[];
    barColor?: number[];
    radius?: number;
    outline?: { width: number, color?: number[] };
    reverse?: boolean;
    stay?: boolean;
    direction?: direction
    mode?: mode
}

const drawStaticBar = (
    k: KAPLAYCtx, 
    width: number, 
    height: number, 
    time: number, 
    pos: { x: number, y: number },
    percentage: number, 
    wColor: number[],
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
        color: k.rgb(wColor[0], wColor[1], wColor[2]),
        radius: radius?? 0,
        outline: {
            width: outline?.width,
            color: outline?.color?
                k.rgb(outline.color[0], outline.color[1], outline.color[2]):
                k.rgb(wColor[0], wColor[1], wColor[2])
        }
    })   

    // Stop updating bar width or height
    if(controller.paused) return percentage
    
    const add = Math.floor(1/time)
    percentage = (percentage + add > 100)? 100 : percentage + add

    // Draw inner bar
    if(direction === 'vertical'){
        const newWidth =  width * (percentage/100)
        k.drawRect({
            width: newWidth,
            height,
            pos: k.vec2(reverse? pos.x + width : pos.x, pos.y),
            radius: radius?? 0,
        })
    }else{
        const newHeight =  height * (percentage/100)
        k.drawRect({
            width,
            height: newHeight,
            pos: k.vec2(reverse? pos.x + width : pos.x, pos.y),
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
         * @param options.wrapperColor - Color of the wrapper in rgb format (default: [0, 0, 0])
         * @param options.barColor - Color of the ATB bar in rgb format (default: [10, 130, 180])
         * @param options.radius - A number to set radius for the corners of the ATB bar (default: null)
         * @param options.outline - A number to set the weight of outline (default  : null)
         * @param options.reverse - If true, the bar will fill in reverse order (default: false)
         * @param options.stay - If true, the bar will stay on the screen after filling (default: false)
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
                direction: 'horizontal'
            }
        ) {
            const { parent, wrapperColor, barColor, radius, outline, reverse, stay, direction, mode } = options;

            let wColor = wrapperColor?? [0, 0, 0];
            let bColor = barColor?? [10, 130, 180];
            
            let percentage = 0

            if(mode === 'dynamic'){
                time = time * 10

                let wrapper: GameObj

                if(parent){
                    wrapper = parent.add([
                        k.rect(width, height),
                        k.pos(pos.x, pos.y),       
                        k.color(wColor[0], wColor[1], wColor[2]),  
                        (outline?.width)?
                            k.outline(
                                outline.width, 
                                (outline.color && outline.color.length)? 
                                    k.rgb(outline.color[0], outline.color[1], outline.color[2]) :
                                    k.rgb(wColor[0], wColor[1], wColor[2])
                            ) :
                            "none"      
                    ])
                }else{
                    wrapper = k.add([
                        k.rect(width, height),
                        k.pos(pos.x, pos.y),       
                        k.color(wColor[0], wColor[1], wColor[2]),  
                        (outline?.width)?
                            k.outline(
                                outline.width, 
                                (outline.color && outline.color.length)? 
                                    k.rgb(outline.color[0], outline.color[1], outline.color[2]) :
                                    k.rgb(wColor[0], wColor[1], wColor[2])
                            ) :
                            "none"      
                    ])                   
                }

                const bar = wrapper.add([
                    k.rect(width, height),
                    k.pos(reverse? pos.x + width : pos.x, pos.y),       
                    k.color(bColor[0], bColor[1], bColor[2]),
                    reverse? k.anchor('topright') : k.anchor('topleft')                      
                ])  
                
                if(radius && radius > 0) {
                    wrapper.radius = radius;
                    bar.radius = radius;
                }
                
                const controller = k.loop(0.1, () => {
                    const add = Math.floor(100/time)
                    percentage = (percentage + add > 100)? 100 : percentage + add

                    if(direction === 'vertical'){
                        const newWidth =  width * (percentage/100)
                        k.tween(bar.width, newWidth, 0, (p) => bar.width = p, k.easings.linear)
                    }else{
                        const newHeight =  height * (percentage/100)
                        k.tween(bar.height, newHeight, 0, (p) => bar.height = p, k.easings.linear)
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
            }else{
                time = time * 60 // Frame      
                
                const controller: customTimeController = {
                    paused: false,
                    cancel: () => {
                        console.log('facking cancel')
                    }
                }                

                if(parent){
                    parent.onDraw(() => {
                        percentage = drawStaticBar(
                            k,
                            width,
                            height,
                            time,
                            pos,
                            percentage,
                            wColor,
                            controller,
                            direction,
                            radius,
                            reverse,
                            outline
                        )
                    })
                }else{
                    k.onDraw(() => {
                        percentage = drawStaticBar(
                            k,
                            width,
                            height,
                            time,
                            pos,
                            percentage,
                            wColor,
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
            }
        }
    };
}
