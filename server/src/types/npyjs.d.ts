declare module 'npyjs' {
    interface NpyData {
        [key: string]: any;
    }

    interface NpyMethods {
        load(path: string): Promise<NpyData>;
        save(path: string, data: NpyData): Promise<void>;
    }

    const npy: NpyMethods;
    export = npy;
}