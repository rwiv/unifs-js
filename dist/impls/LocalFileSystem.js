import { Readable } from "stream";
import path from "path";
import fs from "fs-extra";
import mime from "mime";
import { AbstractFileSystem } from "../AbstractFileSystem.js";
import { getFilename } from "utils-js/path";
import { checkNull } from "utils-js/null";
import { FileNotFoundException } from "../errors.js";
export class LocalFileSystem extends AbstractFileSystem {
    join(...chunks) {
        return path.resolve(...chunks);
    }
    async head(path) {
        try {
            const fileStat = await fs.stat(path);
            return this.parseFileInfo(fileStat, path);
        }
        catch (e) {
            const err = this.parseError(e);
            if (err !== undefined && err.code === "ENOENT") {
                throw new FileNotFoundException("not found file", err.stack);
            }
            else {
                throw e;
            }
        }
    }
    async list(path) {
        try {
            const filenames = await fs.promises.readdir(path);
            const promises = filenames
                .map(filename => this.join(path, filename))
                .map(filepath => this.head(filepath));
            return await Promise.all(promises);
        }
        catch (e) {
            const err = this.parseError(e);
            if (err !== undefined && err.code === "ENOENT") {
                throw new FileNotFoundException("not found directory", err.stack);
            }
            else {
                throw e;
            }
        }
    }
    ensureDir(path) {
        return fs.ensureDir(path);
    }
    getReadable(path) {
        return fs.createReadStream(path);
    }
    async rename(src, dest, overwrite) {
        if (!overwrite) {
            if (await this.exists(dest)) {
                throw Error("file rename failed! dest already exists");
            }
        }
        return fs.rename(src, dest);
    }
    async copy(src, dest, overwrite) {
        if (!overwrite) {
            if (await this.exists(dest)) {
                throw Error("file rename failed! dest already exists");
            }
        }
        return fs.copy(src, dest);
    }
    async writeFile(path, data) {
        if (data instanceof Readable) {
            const ws = fs.createWriteStream(path);
            await new Promise((resolve, reject) => {
                data.pipe(ws);
                ws.on("close", () => resolve());
                ws.on("error", e => reject(e));
            });
        }
        else if (data instanceof Buffer) {
            await fs.writeFile(path, data);
        }
        else if (typeof data === "string") {
            await fs.writeFile(path, data);
        }
        else {
            throw Error("not supported data type");
        }
    }
    removeFile(path) {
        return fs.remove(path);
    }
    removeDirRecursive(path) {
        return fs.remove(path);
    }
    parseFileInfo(fileStat, path) {
        return {
            filename: getFilename(path),
            path: path,
            type: fileStat.isDirectory() ? "directory" : "file",
            mime: mime.getType(path) ?? undefined,
            size: fileStat.size,
            lastModified: fileStat.mtime.toString(),
        };
    }
    parseError(e) {
        try {
            return {
                errno: checkNull(e["errno"]),
                code: checkNull(e["code"]),
                message: checkNull(e["message"]),
                stack: checkNull(e["stack"]),
            };
        }
        catch (e) {
            return undefined;
        }
    }
}
