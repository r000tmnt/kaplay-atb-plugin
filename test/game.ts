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
    {
        stay: true,
        outline: 4,
        radious: 10,
    }
);

atb.bar.add([
    k.text('Flexible ATB', { size: 16, font: "monospace", width: atb.bar.width, align: 'center' }),
])

atb.wrapper.outline.color = k.color(200, 150, 200).color

console.log(atb)

const pauseBtn = k.add([
    k.rect(100, 50),
    k.pos(100, 200),
    k.area(),
    k.color(0, 0, 0)
])

pauseBtn.add([
    k.text("Pause", { size: 24, align: 'center' }),
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

