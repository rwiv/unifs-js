import { createClient } from "webdav";
import { AbstractFileSystem } from "../AbstractFileSystem.js";
import { checkNull } from "utils-js/null";
import { FileNotFoundException } from "../errors.js";
export class WebdavFileSystem extends AbstractFileSystem {
    config;
    constructor(config) {
        super();
        this.config = config;
    }
    async exists(path) {
        return await this.webdavClient().exists(path);
    }
    async head(path) {
        try {
            const fileStat = await this.webdavClient().stat(path);
            return this.parseFileInfo(fileStat);
        }
        catch (e) {
            const err = this.parseError(e);
            if (err !== undefined && err.status === 404) {
                throw new FileNotFoundException("not found file", err.stack);
            }
            else {
                throw e;
            }
        }
    }
    async list(path) {
        try {
            const fileStats = await this.webdavClient().getDirectoryContents(path);
            return fileStats.map(fileStat => this.parseFileInfo(fileStat));
        }
        catch (e) {
            const err = this.parseError(e);
            if (err !== undefined && err.status === 404) {
                throw new FileNotFoundException("not found directory", err.stack);
            }
            else {
                throw e;
            }
        }
    }
    ensureDir(path) {
        return this.webdavClient().createDirectory(path, { recursive: true });
    }
    async getBuffer(path) {
        return await this.webdavClient().getFileContents(path, { format: "binary" });
    }
    getReadable(path) {
        return this.webdavClient().createReadStream(path);
    }
    async writeFile(path, data) {
        await this.webdavClient().putFileContents(path, data);
    }
    removeFile(path) {
        return this.webdavClient().deleteFile(path);
    }
    removeDirRecursive(path) {
        return this.webdavClient().deleteFile(path);
    }
    webdavClient() {
        const { host, username, password } = this.config;
        return createClient(host, {
            username,
            password,
            maxBodyLength: 1024 * 1024 * 1024 * 1024,
            maxContentLength: 1024 * 1024 * 1024 * 1024,
        });
    }
    parseFileInfo(fileStat) {
        return {
            filename: fileStat.basename,
            path: fileStat.filename,
            type: fileStat.type,
            mime: fileStat.mime,
            size: fileStat.size,
            lastModified: fileStat.lastmod,
        };
    }
    parseError(e) {
        try {
            const response = e["response"];
            return {
                status: checkNull(e["status"]),
                statusText: checkNull(response["statusText"]),
                message: checkNull(e["message"]),
                stack: checkNull(e["stack"]),
            };
        }
        catch (e) {
            return undefined;
        }
    }
}
