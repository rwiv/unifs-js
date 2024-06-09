/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { Readable } from "stream";
import { AbstractFileSystem } from "../AbstractFileSystem.js";
import { FileInfo } from "../types.js";
export declare class LocalFileSystem extends AbstractFileSystem {
    join(...chunks: string[]): string;
    head(path: string): Promise<FileInfo>;
    list(path: string): Promise<FileInfo[]>;
    ensureDir(path: string): Promise<void>;
    protected getReadable(path: string): Readable;
    rename(src: string, dest: string, overwrite: boolean): Promise<void>;
    copy(src: string, dest: string, overwrite: boolean): Promise<void>;
    protected writeFile(path: string, data: Readable | Buffer | string): Promise<void>;
    protected removeFile(path: string): Promise<void>;
    protected removeDirRecursive(path: string): Promise<void>;
    private parseFileInfo;
    private parseError;
}
