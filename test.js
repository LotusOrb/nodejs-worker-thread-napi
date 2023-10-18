const axios = require('axios').default;

/**
 * @param {number} sec 
 * @returns {Promise<number>}
 */
const sleep = (sec) => new Promise(resolve => setTimeout(() => resolve(sec), sec))

/**
 * @typedef { 'worker-thread'| 'worker-thread-stat' | 'worker-thread-napi'| 'worker-thread-napi-stat'  |  'main-thread' |  'main-thread-stat'  |  'native-addon' | 'native-addon-stat' } IEndpoint
 * Definition for which endpoint gonna be hit
 */


/**
 * @type {Record<IEndpoint,Array<number>>}
 * Hash Map for stat record
 */
const statHash = {
    "main-thread": [],
    "main-thread-stat": [],
    "worker-thread-napi": [],
    "worker-thread-napi-stat": [],
    "native-addon": [],
    "native-addon-stat": [],
    "worker-thread": [],
    "worker-thread-stat": []
}

/**
 * 
 * @param {IEndpoint} p Which endpoint
 * @param {number} q Fib sequence
 * @returns {string}
 * Make Request for testing the endpoint
 */
const MakeRequest = async (p, q) => (await axios.get(`http://localhost:3000/${p}${q ? '?q=' + q : '/'}`, { timeout: 0 })).data.result

/**
 * @param {IEndpoint} testOnWhat 
 * @param {number} concurrentRequest
 * @param {number} fibSeq
 * @param {Boolean} shouldAddByIndex
 */
const test = async (testOnWhat, concurrentRequest = 0, fibSeq = 40, shouldAddByIndex = false) => {
    try {
        const t0 = performance.now()

        let task = []

        for (let index = 0; index < concurrentRequest; index++) {
            task.push(MakeRequest(testOnWhat, shouldAddByIndex ? fibSeq + index : fibSeq))
        }

        const res = await Promise.all(task)
        const t1 = performance.now()
        const timing = (t1 - t0)
        console.log(`Finish Running ${testOnWhat} \n concurrent : ${concurrentRequest} seq : ${fibSeq}`);
        statHash[testOnWhat].push(timing)
    } catch (error) {
        console.log(`Error Running ${testOnWhat}`);
    }
}


async function main() {

    /**
     * @type {Array<IEndpoint>}
     */
    const arrOfEndpoint = ['worker-thread', 'worker-thread-napi', 'native-addon', 'main-thread']

    for (let indexEndpoint = 0; indexEndpoint < arrOfEndpoint.length; indexEndpoint++) {
        for (let index = 0; index < 10; index++) {
            await test(arrOfEndpoint[indexEndpoint], 10, 30 + index, false);
        }
        // Waiting for backpreasure
        await sleep(10000)
    }



    const ArrayOfObjectStat = []
    // Turn Into Array Of Object Stat, for pretify looks on console table
    Object.keys(statHash).forEach((statKey) => {
        statHash[statKey].forEach((v, idx) => {
            ArrayOfObjectStat[idx] = { ...ArrayOfObjectStat[idx], ...{ [statKey]: v } }

            if (statHash[statKey].length === idx + 1 && !statKey.includes('-stat')) {
                ArrayOfObjectStat['avg'] = { ...ArrayOfObjectStat['avg'], [statKey]: (statHash[statKey].reduce((p, n) => p + n) / statHash[statKey].length) }
            }
        })
    })
    // log result for performance
    console.table(ArrayOfObjectStat)


}

main()