import express from "express";
import path from "node:path";
import { Worker } from 'node:worker_threads'
import binding from 'bindings';
import os from 'os';
import * as uuid from 'uuid';
import { fib } from "./fib";

// Initate Binding addons
const nativeAddon = binding('addon.node')

// File resolver for worker
const fileResolver = function (filename: string) {
    return path.resolve(path.join(__dirname, filename.replace('.ts', '.js')))
}

// Initate Worker based on number of cpus
const arrOfWorker = os.cpus().map(() => ({ worker: new Worker(fileResolver('worker.ts')), inProccess: 0 }))

// Find Least ConnWorker + index
const leastConnWorker = () => {
    const averageProcces = arrOfWorker.map(x => x.inProccess).reduce((p, n) => p + n) / arrOfWorker.length
    const pickedWorker = arrOfWorker.find(x => x.inProccess <= averageProcces)
    const indexOfWorker = arrOfWorker.indexOf(pickedWorker)
    return { ...pickedWorker, indexOfWorker }
}
// Initate Worker based on number of cpus
const arrOfWorkerNapi = os.cpus().map(() => ({ worker: new Worker(fileResolver('worker-napi.ts')), inProccess: 0 }))

// Find Least ConnWorker + index
const leastConnWorkerNapi = () => {
    const averageProcces = arrOfWorkerNapi.map(x => x.inProccess).reduce((p, n) => p + n) / arrOfWorkerNapi.length
    const pickedWorker = arrOfWorkerNapi.find(x => x.inProccess <= averageProcces)
    const indexOfWorker = arrOfWorkerNapi.indexOf(pickedWorker)
    return { ...pickedWorker, indexOfWorker }
}

// Initiate express FN
const app = express()



// Worker thread FN
const runOnWorkerThreads = (param: number) => {
    return new Promise<number>((resolve) => {
        const wkr = leastConnWorker()
        wkr.worker.setMaxListeners(1000)
        const messageId = uuid.v4()

        const messageListener = (ev: { messageId: string, seq: number }) => {
            if (messageId === ev.messageId) {
                arrOfWorker[wkr.indexOfWorker].inProccess = arrOfWorker[wkr.indexOfWorker].inProccess - 1
                wkr.worker.off('message', messageListener)
                resolve(ev.seq)
            }
        }

        wkr.worker.on('message', messageListener)

        arrOfWorker[wkr.indexOfWorker].inProccess = arrOfWorker[wkr.indexOfWorker].inProccess + 1
        wkr.worker.postMessage({ messageId, seq: param })
    })
}
// Worker thread napi FN
const runOnWorkerThreadsNapi = (param: number) => {
    return new Promise<number>((resolve, rejects) => {
        const wkr = leastConnWorkerNapi()
        wkr.worker.setMaxListeners(1000)
        const messageId = uuid.v4()

        const messageListener = (ev: { messageId: string, seq: number }) => {
            if (messageId === ev.messageId) {
                arrOfWorkerNapi[wkr.indexOfWorker].inProccess = arrOfWorkerNapi[wkr.indexOfWorker].inProccess - 1
                wkr.worker.off('message', messageListener)
                resolve(ev.seq)
            }
        }

        wkr.worker.on('message', messageListener)

        arrOfWorkerNapi[wkr.indexOfWorker].inProccess = arrOfWorkerNapi[wkr.indexOfWorker].inProccess + 1
        wkr.worker.postMessage({ messageId, seq: param })
    })
}

// Endpoint for main thread
app.get('/main-thread', async (req, res) => {
    let result = 0;
    const q = req.query.q
    if (q && typeof q === 'string') {
        result = fib(parseInt(q))
    }
    res.json({ result })
})

// Endpoint for main thread
app.get('/native-addon', async (req, res) => {
    let result = 0;
    const q = req.query.q
    if (q && typeof q === 'string') {
        result = nativeAddon.fibCPP(parseInt(q))
    }
    res.json({ result })
})

// Endpoint for worker thread
app.get('/worker-thread', async (req, res) => {
    let result = 0;
    const q = req.query.q
    if (q && typeof q === 'string') {
        result = await runOnWorkerThreads(parseInt(q))
    }
    res.json({ result })
})

// Endpoint for worker thread + napi
app.get('/worker-thread-napi', async (req, res) => {
    let result = 0;
    const q = req.query.q
    if (q && typeof q === 'string') {
        result = await runOnWorkerThreadsNapi(parseInt(q))
    }
    res.json({ result })
})



app.listen(3000,()=>{
    console.log('Running On Port : 3000')
})