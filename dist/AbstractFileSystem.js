import { readableToBuffer } from "utils-js/buffer";
import { FileNotFoundException } from "./errors.js";
export class AbstractFileSystem {
    async exists(path) {
        try {
            await this.head(path);
            return true;
        }
        catch (e) {
            if (e instanceof FileNotFoundException) {
                return false;
            }
            else {
                throw e;
            }
        }
    }
    async readStream(path) {
        const info = await this.head(path);
        if (info.type === "directory") {
            throw Error("file is directory");
        }
        return this.getReadable(path);
    }
    async readBuffer(path) {
        const rs = await this.readStream(path);
        return readableToBuffer(rs);
    }
    async readText(path) {
        const buffer = await this.readBuffer(path);
        return buffer.toString("utf-8");
    }
    join(...chunks) {
        return chunks.join("/");
    }
    async write(path, data, overwrite) {
        if (!overwrite) {
            if (await this.exists(path)) {
                throw Error("file write failed! file already exists");
            }
        }
        await this.writeFile(path, data, overwrite);
    }
    async remove(path, recursive = true) {
        const info = await this.head(path);
        if (info.type === "file") {
            await this.removeFile(path);
        }
        const files = await this.list(path);
        if (files.length > 0) {
            if (!recursive) {
                throw Error("file exists in the directory");
            }
            else {
                await this.removeDirRecursive(path);
            }
        }
        else {
            await this.removeFile(path);
        }
        return info;
    }
    async findFilesRecursive(path) {
        const files = [];
        await this.fileTraverse(path, async (file) => {
            files.push(file);
        });
        return files;
    }
    async fileTraverse(path, fn) {
        const root = await this.head(path);
        return this.fileTraverseRecursive(root, fn);
    }
    async fileTraverseRecursive(file, fn) {
        if (file.type === "file") {
            return await fn(file);
        }
        const files = await this.list(file.path);
        for (const file of files) {
            await this.fileTraverseRecursive(file, fn);
        }
    }
}
