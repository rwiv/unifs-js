/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { Readable } from "stream";
import { AbstractFileSystem } from "../AbstractFileSystem.js";
import { FileInfo } from "../types.js";
export interface WebdavError {
    status: number;
    statusText: string;
    message: string;
    stack: string;
}
export interface WebdavConfig {
    host: string;
    username: string;
    password: string;
}
export declare class WebdavFileSystem extends AbstractFileSystem {
    readonly config: WebdavConfig;
    constructor(config: WebdavConfig);
    exists(path: string): Promise<boolean>;
    head(path: string): Promise<FileInfo>;
    list(path: string): Promise<FileInfo[]>;
    ensureDir(path: string): Promise<void>;
    protected getBuffer(path: string): Promise<Buffer>;
    protected getReadable(path: string): Readable;
    protected writeFile(path: string, data: Readable | Buffer | string): Promise<void>;
    protected removeFile(path: string): Promise<void>;
    protected removeDirRecursive(path: string): Promise<void>;
    private webdavClient;
    private parseFileInfo;
    private parseError;
}
