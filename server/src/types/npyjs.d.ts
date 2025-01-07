declare module 'npyjs' {
    interface NpyParsed {
        dtype: string;
        data: Uint8Array;
        shape: number[];
        fortranOrder: boolean;
    }

    interface NpyArray {
        moves?: any[];
        metadata?: Record<string, any>;
        [key: string]: any;
    }

    export default class NpyJS {
        constructor();
        load(path: string): Promise<NpyParsed>;
        parse(data: Uint8Array): NpyParsed;
        arrayify(parsed: NpyParsed): NpyArray;
        saveArrayAs(path: string, array: NpyArray, dtype?: string): Promise<void>;
    }
}