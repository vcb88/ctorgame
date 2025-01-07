declare module 'npyjs' {
    interface NpyData {
        [key: string]: any;
    }

    export default class NpyJS {
        constructor();
        load(path: string): Promise<NpyData>;
        save(path: string, data: NpyData): Promise<void>;
    }
}