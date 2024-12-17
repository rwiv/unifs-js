import { AbstractFileSystem } from "../AbstractFileSystem.js";
import { PassThrough } from "node:stream";
import { Readable } from "stream";
import { FileInfo } from "../types.js";
export interface FtpError {
    name: string;
    code: number;
    stack: string;
    message: string;
}
export interface FtpConfig {
    host: string;
    port: number;
    user: string;
    password: string;
}
export declare class FtpFileSystem extends AbstractFileSystem {
    readonly config: FtpConfig;
    constructor(config: FtpConfig);
    head: (path: string) => Promise<FileInfo>;
    list: (path: string) => Promise<FileInfo[]>;
    ensureDir: (path: string) => Promise<void>;
    protected getReadable(path: string): PassThrough;
    protected writeFile: (path: string, data: Readable | Buffer | string) => Promise<void>;
    protected removeFile: (path: string) => Promise<void>;
    protected removeDirRecursive: (path: string) => Promise<void>;
    private connect;
    private parseFileInfo;
    private parseError;
}
