import { parentPort } from "node:worker_threads";
import { fib } from './fib'


// Using Event Driven rather than using workerData
if (parentPort?.on) {
    parentPort.on("message", (ev) => {
        const res = fib(ev.seq)
        parentPort?.postMessage({ seq: res, messageId: ev.messageId, })
    })
}