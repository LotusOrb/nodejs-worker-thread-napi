declare module 'bindings' {
    type returnOfbinding = {
        fibCPP: (param: number) => number
    }
    function bindings(mod: string): returnOfbinding;

    export = bindings
}