import { parentPort } from "node:worker_threads";
import bindings from "bindings";

const nativeAddon = bindings('addon.node')


// Using Event Driven rather than using workerData
if (parentPort?.on) {
    parentPort.on("message", (ev) => {
        const res = nativeAddon.fibCPP(ev.seq)
        parentPort?.postMessage({ seq: res, messageId: ev.messageId, })
    })
}