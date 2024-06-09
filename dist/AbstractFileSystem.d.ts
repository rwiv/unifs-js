/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { Readable } from "stream";
import { FileBuffer, FileInfo, FileStream, FileSystem } from "./fs_types.js";
export declare abstract class AbstractFileSystem implements FileSystem {
    abstract exists(path: string): Promise<boolean>;
    abstract head(path: string): Promise<FileInfo>;
    abstract list(path: string): Promise<FileInfo[]>;
    abstract ensureDir(path: string): Promise<void>;
    protected abstract getBuffer(path: string): Promise<Buffer>;
    protected abstract getReadable(path: string): Readable;
    protected abstract writeFile(path: string, data: Readable | Buffer | string, overwrite: boolean): Promise<void>;
    protected abstract removeFile(path: string): Promise<void>;
    protected abstract removeDirRecursive(path: string): Promise<void>;
    readToString(path: string): Promise<string>;
    join(...chunks: string[]): string;
    protected checkBeforeRead(path: string): Promise<FileInfo>;
    get(path: string): Promise<FileBuffer>;
    read(path: string): Promise<FileStream>;
    write(path: string, data: Readable | Buffer | string, overwrite: boolean): Promise<void>;
    remove(path: string, recursive?: boolean): Promise<FileInfo>;
    findFilesRecursive(path: string): Promise<FileInfo[]>;
    fileTraverse(path: string, fn: (file: FileInfo) => Promise<void>): Promise<void>;
    private fileTraverseRecursive;
}
