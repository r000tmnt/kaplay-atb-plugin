import type { GameObj, TimerController, KAPLAYCtx } from "kaplay";

export interface ATBBar {
    wrapper: GameObj;
    bar: GameObj;
    controller: TimerController;
    pause: Function;
    remove: Function;
}

/**
 * @param wrapperColor - Optional color for the wrapper of the ATB bar in rgb format
 * @param barColor - Optional color for the ATB bar in rgb format
 * @param radious - Optional radius for the corners of the ATB bar
 * @param outline - If true, the bar will have an outline
 * @param reverse - If true, the bar will go in reverse order (from right to left)
 */
interface ATBPOptions{
    wrapperColor?: number[];
    barColor?: number[];
    radious?: number;
    outline?: number;
    reverse?: boolean;
    stay?: boolean;
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
         * @param options.radious - A number to set radius for the corners of the ATB bar (default: null)
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
            options: ATBPOptions = {
                radious: -1,
                outline: -1,
            }
        ) {
            const { wrapperColor, barColor, radious, outline, reverse, stay } = options;

            let wColor = wrapperColor?? [0, 0, 0];
            let bColor = barColor?? [10, 130, 180];

            const wrapper = k.add([
                k.rect(width, height),
                k.pos(pos.x, pos.y),       
                (reverse)? k.color(bColor[0], bColor[1], bColor[2]) : k.color(wColor[0], wColor[1], wColor[2]),  
                k.outline(outline, (reverse)? k.color(bColor[0], bColor[1], bColor[2]).color : k.color(wColor[0], wColor[1], wColor[2]).color)          
            ])
        
            let percentage = (reverse)? 100 : 0

            time = time * 10

            const bar = k.add([
                k.rect(width, height),
                k.pos(pos.x, pos.y),       
                (reverse)? k.color(wColor[0], wColor[1], wColor[2]) : k.color(bColor[0], bColor[1], bColor[2])                        
            ])  
            
            if(radious) {
                wrapper.radius = radious;
                bar.radius = radious;
            }
            
            const controller = k.loop(0.1, () => {
                const add = Math.floor(100/time)
                if(reverse) {
                    percentage = (percentage - add < 0)? 0 : percentage - add
                }else{
                    percentage = (percentage + add > 100)? 100 : percentage + add
                }
                const newWidth = width * (percentage/100)
                k.tween(bar.width, newWidth, 0, (p) => bar.width = p, k.easings.linear)
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
                    this.wrapper.destroy();
                    this.bar.destroy();
                }
            } as ATBBar;
        }
    };
}
