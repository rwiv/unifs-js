import { Readable } from "stream";
export interface FileSystem {
    join(...chunks: string[]): string;
    exists(path: string): Promise<boolean>;
    head(path: string): Promise<FileInfo>;
    list(path: string): Promise<FileInfo[]>;
    ensureDir(path: string): Promise<void>;
    readStream(path: string): Promise<Readable>;
    readBuffer(path: string): Promise<Buffer>;
    readText(path: string): Promise<string>;
    write(path: string, data: Readable | Buffer | string, overwrite: boolean): Promise<void>;
    remove(path: string): Promise<FileInfo>;
}
export interface FileInfo {
    filename: string;
    path: string;
    type: "file" | "directory";
    mime: string | undefined;
    size: number;
    lastModified: string | undefined;
}
