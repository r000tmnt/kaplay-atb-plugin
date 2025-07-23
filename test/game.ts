import kaplay from "kaplay";
import ATB from "../src/plugin";

const k = kaplay({
    width: 800,
    height: 600,
    plugins: [ATB],
});

const atb = k.createATB(
    10, 
    200, 
    20, 
    { x: 100, y: 100 }, 
    () => { console.log("ATB filled!") },
    null,
    null,
    true
);

const pauseBtn = k.add([
    k.rect(100, 50),
    k.pos(100, 200),
    k.area(),
    k.color(0, 0, 0)
])

pauseBtn.add([
    k.text("Pause", { size: 24 }),
])

const removeBtn = k.add([
    k.rect(100, 50),
    k.pos(100, 350),
    k.area(),
    k.color(0, 0, 0)
])

removeBtn.add([
    k.text("Remove", { size: 24 }),
])

pauseBtn.onClick(() => {
    atb.pause();
});

removeBtn.onClick(() => {
    atb.remove()
})

