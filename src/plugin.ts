import type { GameObj, TimerController, KAPLAYCtx } from "kaplay";

export interface ATBBar {
    wrapper: GameObj;
    bar: GameObj;
    controller: TimerController;
    pause: Function;
    remove: Function;
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
         * @param wrapperColor - Optional color for the wrapper of the ATB bar in rgb format
         * @param barColor - Optional color for the ATB bar in rgb format
         * @param reverse - If true, the bar will go in reverse order (from right to left)
         * @returns - An object containing the wrapper, bar, and controller for the ATB bar
         */
        createATB(
            time: number, 
            width: number, 
            height: number, 
            pos: { x: number, y: number },
            action: Function,
            wrapperColor: number[] | null = null,
            barColor: number[] | null = null,
            reverse: boolean = false
        ) {
            let wColor = wrapperColor ? wrapperColor : [0, 0, 0];
            let bColor = barColor ? barColor : [10, 130, 180];

            const wrapper = k.add([
                k.rect(width, height),
                k.pos(pos.x, pos.y),       
                (reverse)? k.color(bColor[0], bColor[1], bColor[2]) : k.color(wColor[0], wColor[1], wColor[2])                       
            ])
        
            let percentage = (reverse)? 100 : 0

            time = time * 10

            const bar = k.add([
                k.rect(width, height),
                k.pos(pos.x, pos.y),       
                (reverse)? k.color(wColor[0], wColor[1], wColor[2]) : k.color(bColor[0], bColor[1], bColor[2])                        
            ])    
            
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
                wrapper.destroy()
                bar.destroy()
            })

            console.log(controller)

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
