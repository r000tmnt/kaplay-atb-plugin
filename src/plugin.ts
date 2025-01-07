import type { KAPLAYCtx } from "kaplay";

export default function myPlugin(k: KAPLAYCtx) {
    return {
        hi() {
            k.debug.log("hi");
        },
    };
}
