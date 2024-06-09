/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { FileInfo, FileSystem } from "./types.js";
import { Readable } from "stream";
export declare abstract class AbstractFileSystem implements FileSystem {
    abstract head(path: string): Promise<FileInfo>;
    abstract list(path: string): Promise<FileInfo[]>;
    abstract ensureDir(path: string): Promise<void>;
    protected abstract getReadable(path: string): Readable;
    protected abstract writeFile(path: string, data: Readable | Buffer | string, overwrite: boolean): Promise<void>;
    protected abstract removeFile(path: string): Promise<void>;
    protected abstract removeDirRecursive(path: string): Promise<void>;
    exists(path: string): Promise<boolean>;
    readStream(path: string): Promise<Readable>;
    readBuffer(path: string): Promise<Buffer>;
    readText(path: string): Promise<string>;
    join(...chunks: string[]): string;
    write(path: string, data: Readable | Buffer | string, overwrite: boolean): Promise<void>;
    remove(path: string, recursive?: boolean): Promise<FileInfo>;
    findFilesRecursive(path: string): Promise<FileInfo[]>;
    fileTraverse(path: string, fn: (file: FileInfo) => Promise<void>): Promise<void>;
    private fileTraverseRecursive;
}
