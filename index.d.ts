export = io_extra;
declare const io_extra: {
    directory: {
        clean(directory: string): Promise<any>;
        copy(src: string, dest: string): Promise<string>;
        copy(src: string, dest: string, filter: CopyFilter): Promise<string>;
        copy(src: string, dest: string, options: CopyOptions): Promise<string>;
        create(directory: string): Promise<string>;
        delete(directory: string): Promise<any>;
        empty(directory: string): Promise<any>;
        exists(directory: string): Promise<boolean>;
        move(src: string, dest: string, overwrite?: boolean): Promise<string>;
        path(directory: string): Promise<string>;
        remove(directory: string): Promise<any>;
        rename(src: string, dest: string, overwrite?: boolean): Promise<any>;
    };
    file: {
        copy(src: string, dest: string, overwrite?: boolean, preserveTimestamps?: boolean): Promise<string>;
        create(file: string): Promise<string>;
        delete(file: string): Promise<any>;
        exists(file: string): Promise<boolean>;
        move(src: string, dest: string, overwrite?: boolean): Promise<string>;
        path(file: string): Promise<string>;
        read(file: string, encoding?: Encodings): Promise<string>;
        remove(file: string): Promise<any>;
        rename(src: string, dest: string, overwrite?: boolean): Promise<any>;
        write(file: string, data: any, encoding?: Encodings): Promise<any>;
    };
};

type Encodings = 'ascii' | 'utf8' | 'base64';

type CopyFilter = CopyFilterFunction | RegExp;

interface CopyFilterFunction {
    (src: string): boolean
}

interface CopyOptions {
    overwrite?: boolean;
    preserveTimestamps?: boolean;
    dereference?: boolean;
    filter?: CopyFilter;
    recursive?: boolean;
}

interface MoveOptions {
    overwrite?: boolean;
    limit?: number;
}

