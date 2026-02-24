import type { GameObj, TimerController, KAPLAYCtx, Color, Vec2, KEventController } from "kaplay";

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
    done: boolean,
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
    mode?: mode,
    text?: {
        text: string,
        color?: Color,
        anchor?: 'start'|'center'|'end'
    }
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
    direction: direction,
    radius?: ATBOptions['radius'],
    reverse?: ATBOptions['reverse'],
    outline?: ATBOptions['outline'],
    text?: {
        sprite: string,
        color: Color,
        anchor: 'start'|'center'|'end'
        pos: { x: number, y: number }
    }
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

    let innerBarPos : Vec2
    const barWidth = outline?.width? width - outline.width : width
    const barHeight = outline?.width? height - outline.width : height

    // Draw inner bar
    if(direction === 'vertical'){
        innerBarPos = k.vec2(pos.x, reverse? pos.y + barHeight : pos.y)
        const newHeight =  barHeight * percentage

        if(outline?.width){
            innerBarPos.x += outline.width / 2
            innerBarPos.y += outline.width / 2
        }

        k.drawRect({
            width: barWidth,
            height: newHeight,
            pos: innerBarPos,
            color: bColor,
            radius: radius?? 0,
            anchor: reverse? 'botleft' : 'topleft'
        })
    }else{
        innerBarPos = k.vec2(reverse? pos.x + barWidth : pos.x, pos.y)
        const newWidth =  barWidth * percentage

        if(outline?.width){
            innerBarPos.x += outline.width / 2
            innerBarPos.y += outline.width / 2
        }

        k.drawRect({
            width: newWidth,
            height: barHeight,
            pos: innerBarPos,
            color: bColor,
            radius: radius?? 0,
            anchor: reverse? 'topright' : 'topleft'
        })        
    }       

    if(text){
        k.drawSprite({
            sprite: text.sprite,
            pos: k.vec2(
                (innerBarPos.x === pos.x)? innerBarPos.x + text.pos.x : pos.x + text.pos.x, 
                (innerBarPos.y === pos.y)? innerBarPos.y + text.pos.y : pos.y + text.pos.y),
        })
    }

    return percentage
}

// Invisible canvas to measure text width
// Reference: https://stackoverflow.com/a/47376591/14173422
const prepareTextSprite = (k: KAPLAYCtx, text: string, color: Color, direction: direction, outline = 0) => {

    const textCanvas = document.createElement('canvas');                    
    if(direction === 'vertical'){
        textCanvas.width = 16
        textCanvas.height = text.length * 16
        const ctx = textCanvas.getContext('2d');
        if(ctx){
            // console.log('measuring text', ctx.measureText(text).width)
            textCanvas.height += (ctx.measureText(text).width / 2)
            ctx.font = '16px monospace';
            ctx.fillStyle = color.toHex();
            ctx.textAlign = "center";                              
        }
        
        for(let i=0; i < text.length; i++){
            ctx?.fillText(text[i], textCanvas.width / 2, textCanvas.width + (i * 16));
        }
    }else{
        const ctx = textCanvas.getContext('2d');
        if(ctx){
            textCanvas.width = text.length * 16
            textCanvas.height = 16
            ctx.font = '16px monospace';
            ctx.fillStyle = 'white';
            ctx.textAlign = "center";                              
            ctx.fillText(text, textCanvas.width / 2, outline? textCanvas.height - outline : textCanvas.height - 2);
        }
    }

    const dataURL: string = textCanvas.toDataURL();
    const name = 'atb-text' + Date.now() // Unique name for the sprite

    k.loadSprite(name, dataURL)    

    return { textCanvas, name }
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
         * @param options.mode - The default is dynamic. Set to static if you have no need to manipulate the bar further more. Which means the bar will render with onDraw event.
         * @param options.text - Support TextCompOpt or DrawTextOpt from Kaplay. The minimum params as list below.
            * @param options.text.text - The text to display.
            * @param options.text.color - The color of the text. Default to white.
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
                mode: 'dynamic'
            }
        ) {
            let { parent, wrapperColor, barColor, radius, outline, reverse, stay, mode, text } = options;

            let wColor = wrapperColor?? k.rgb(0, 0, 0);
            let bColor = barColor?? k.rgb(10, 130, 180);
            
            let percentage = 0

            const direction = width > height? 'horizontal' : 'vertical'
            mode = mode?? 'dynamic'

            if(mode === 'static'){
                time = time * 60 // Frame      

                // Cancel state
                let cancel = false
                let textOptions = {
                    sprite: '',
                    color: text?.color?? k.rgb(255, 255, 255),
                    anchor: text?.anchor?? 'center',
                    pos: { x: 0, y: 0 }
                }
                
                const controller: customTimeController = {
                    paused: false,
                    done: false,
                    cancel: () => {
                        console.log('faking cancel')
                        cancel = true
                        percentage = 0
                    }
                }         
                
                if(text){
                    let { textCanvas, name } : { textCanvas: HTMLCanvasElement | null, name: string } = prepareTextSprite(k, text.text, text.color?? k.rgb(255, 255, 255), direction, outline?.width?? 0)
                    textOptions.sprite = name
                    textOptions.pos =
                        direction === 'vertical'?
                            textOptions.anchor === 'center'?
                                { x: (width - textCanvas.width) / 2, y: (height / 2) - (textCanvas.height / 2)}:
                            textOptions.anchor === 'start'?
                                { x: (width - textCanvas.width) / 2, y: reverse? height - textCanvas.height : 0 }:
                                { x: (width - textCanvas.width) / 2, y: reverse? 0 : height - textCanvas.height } :
                        // Horizontal
                        textOptions.anchor === 'center'?
                        { x: reverse? 0 - (textCanvas.width + (Math.abs(width - textCanvas.width) / 2)) : (width / 2) - (textCanvas.width / 2), y:  0 }:
                        textOptions.anchor === 'start'?
                        { x: 0, y: 0 }:
                        { x: width - textCanvas.width, y: 0 }

                    textCanvas = null // Clean up the canvas element after use
                }

                let onDrawEvent : KEventController

                if(parent){
                    onDrawEvent = parent.onDraw(() => {
                        if(cancel) onDrawEvent.cancel()  
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
                            outline,
                            textOptions
                        )

                        if(percentage === 1 && !controller.done){
                            controller.done = true
                            action()
                            if(!stay){
                                // Stop onDraw event      
                                onDrawEvent.cancel()        
                            }                               
                        }
                    })
                }else{
                    onDrawEvent = k.onDraw(() => {
                        if(cancel) onDrawEvent.cancel()  
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
                            outline,
                            textOptions
                        )

                        if(percentage === 1 && !controller.done){
                            controller.done = true
                            action()
                            if(!stay){
                                // Stop onDraw event      
                                onDrawEvent.cancel()        
                            }                               
                        }                        
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
                const barPos = { x:0, y:0 }

                if(outline?.width){
                    barPos.x += outline.width / 2
                    barPos.y += outline.width / 2
                }

                if(direction === 'vertical' && reverse){
                    barPos.y += barHeight
                }

                if(direction === 'horizontal' && reverse){
                    barPos.x += barWidth
                }

                const bar = wrapper.add([
                    k.area(),
                    k.rect(barWidth, barHeight),
                    k.pos(barPos.x, barPos.y),       
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

                if(options.text){
                    const text = options.text.text
                    if(!options.text.anchor) options.text.anchor = 'center'
                    let { textCanvas, name } : { textCanvas: HTMLCanvasElement | null, name: string } = prepareTextSprite(k, text, options.text.color?? k.rgb(255, 255, 255), direction, outline?.width?? 0)

                    bar.add([
                        k.area(),
                        k.sprite(name),
                        direction === 'vertical'?
                            options.text.anchor === 'center'?
                                k.pos(0, reverse? 0 - (textCanvas.height + barHeight) / 2 : (barHeight / 2) - (textCanvas.height / 2)) :
                            options.text.anchor === 'start'?
                                k.pos(0, reverse? 0 - textCanvas.height : 0) :
                                k.pos(barWidth - textCanvas.width, reverse? 0 - barHeight : barHeight - textCanvas.height) :
                        // Horizontal
                        options.text.anchor === 'center'?
                            k.pos(reverse? 0 - (textCanvas.width + (Math.abs(barWidth - textCanvas.width) / 2)) : 
                            (barWidth / 2) - (textCanvas.width / 2), 0) :
                        options.text.anchor === 'start'?    
                            k.pos(reverse? 0 - textCanvas.width : 0, 0) :
                            k.pos(reverse? 0 - barWidth : barWidth - textCanvas.width, 0)
                    ])

                    // bar.add([
                    //     k.text(`[vertical]${text}[/vertical]`, { 
                    //         size: 16, 
                    //         font: "monospace",
                    //         align: options.text.anchor?? 'left',
                    //         width: barWidth,
                    //         styles: {
                    //             "vertical": (idx, ch) => {
                    //                 const chX = ctx? 0 - ctx.measureText(text.substring(0, (idx + 1) === text.length? idx : idx + 1)).width : (0 - idx) * 16
                    //                 const chY = idx * 16;

                    //                 console.log('styling', idx, chX)

                    //                 return {
                    //                     pos: k.vec2(chX, chY),
                    //                 }
                    //             }
                    //         }
                    //     }),
                    //     k.color(options.text.color?? k.rgb(255, 255, 255)),
                    //     k.pos(0, 0)
                    // ])   

                    textCanvas = null // Clean up the canvas element after use
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
