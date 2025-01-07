import kaplay from "kaplay";
import myPlugin from "../src/plugin";

const k = kaplay({
    plugins: [myPlugin],
});

k.hi();
