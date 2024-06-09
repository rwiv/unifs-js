/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { Readable } from "stream";
export interface FileSystem {
    join(...chunks: string[]): string;
    exists(path: string): Promise<boolean>;
    head(path: string): Promise<FileInfo>;
    list(path: string): Promise<FileInfo[]>;
    ensureDir(path: string): Promise<void>;
    read(path: string): Promise<FileStream>;
    readBuffer(path: string): Promise<Buffer>;
    readText(path: string): Promise<string>;
    get(path: string): Promise<FileBuffer>;
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
export interface FileStream {
    info: FileInfo;
    stream: Readable;
}
export interface FileBuffer {
    info: FileInfo;
    buffer: Buffer;
}
