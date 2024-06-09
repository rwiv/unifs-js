import { Client } from "basic-ftp";
import mime from "mime";
import { AbstractFileSystem } from "../AbstractFileSystem.js";
import { getDirPath, getFilename } from "utils-js/path";
import { getFirstElem } from "utils-js/list";
import { PassThrough } from "node:stream";
import { Readable } from "stream";
import { checkNull } from "utils-js/null";
import { FileNotFoundException } from "../errors.js";
export class FtpFileSystem extends AbstractFileSystem {
    config;
    constructor(config) {
        super();
        this.config = config;
    }
    head = (path) => this.connect(async (client) => {
        const children = await this.list(getDirPath(path, "/"));
        const info = getFirstElem(children, file => file.path === path);
        if (info === undefined) {
            throw new FileNotFoundException("not found file");
        }
        return info;
    });
    list = (path) => this.connect(async (client) => {
        try {
            const stats = await client.list(path);
            return stats.map(stat => this.parseFileInfo(stat, path));
        }
        catch (e) {
            const err = this.parseError(e);
            if (err !== undefined && err.code === 550) {
                throw new FileNotFoundException("not found file", err.stack);
            }
            else {
                throw e;
            }
        }
    });
    ensureDir = (path) => this.connect(async (client) => {
        return client.ensureDir(path);
    });
    getReadable(path) {
        const stream = new PassThrough();
        const { host, port, user, password } = this.config;
        const client = new Client();
        client.access({ host, port, user, password }).then(async () => {
            await client.downloadTo(stream, path);
            client.close();
        });
        return stream;
    }
    writeFile = (path, data) => this.connect(async (client) => {
        if (data instanceof Buffer) {
            await client.uploadFrom(Readable.from(data), path);
        }
        else if (typeof data === "string") {
            await client.uploadFrom(Readable.from(data), path);
        }
        else if (data instanceof Readable) {
            await client.uploadFrom(data, path);
        }
        else {
            throw Error("not supported data type");
        }
    });
    removeFile = (path) => this.connect(async (client) => {
        await client.remove(path);
    });
    removeDirRecursive = (path) => this.connect(async (client) => {
        await client.removeDir(path);
    });
    async connect(fn) {
        const { host, port, user, password } = this.config;
        const client = new Client();
        try {
            await client.access({ host, port, user, password });
            return await fn(client);
        }
        catch (e) {
            throw e;
        }
        finally {
            client.close();
        }
    }
    parseFileInfo(stat, dirPath) {
        return {
            filename: getFilename(stat.name),
            path: dirPath + "/" + stat.name.replace(dirPath, ""),
            type: stat.type === 2 ? "directory" : "file",
            mime: mime.getType(stat.name) ?? undefined,
            size: stat.size,
            lastModified: stat.modifiedAt?.toString(),
        };
    }
    parseError(e) {
        try {
            return {
                name: checkNull(e["name"]),
                code: checkNull(e["code"]),
                stack: checkNull(e["stack"]),
                message: checkNull(e["message"]),
            };
        }
        catch (e) {
            return undefined;
        }
    }
}
