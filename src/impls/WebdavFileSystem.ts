import {createClient, FileStat} from "webdav";
import {Readable} from "stream";
import {AbstractFileSystem} from "../AbstractFileSystem.js";
import {FileInfo} from "../types.js";
import {checkNull} from "utils-js/null";
import {FileNotFoundException} from "../errors.js";

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

export class WebdavFileSystem extends AbstractFileSystem {

  constructor(public readonly config: WebdavConfig) {
    super();
  }

  async exists(path: string) {
    return await this.webdavClient().exists(path);
  }

  async head(path: string) {
    try {
      const fileStat = await this.webdavClient().stat(path) as FileStat;
      return this.parseFileInfo(fileStat);
    } catch (e) {
      const err = this.parseError(e);
      if (err !== undefined && err.status === 404) {
        throw new FileNotFoundException("not found file", err.stack);
      } else {
        throw e;
      }
    }
  }

  async list(path: string) {
    try {
      const fileStats = await this.webdavClient().getDirectoryContents(path) as FileStat[];
      return fileStats.map(fileStat => this.parseFileInfo(fileStat));
    } catch (e) {
      const err = this.parseError(e);
      if (err !== undefined && err.status === 404) {
        throw new FileNotFoundException("not found directory", err.stack);
      } else {
        throw e;
      }
    }
  }

  ensureDir(path: string) {
    return this.webdavClient().createDirectory(path, { recursive: true });
  }

  protected getReadable(path: string): Readable {
    return this.webdavClient().createReadStream(path);
  }

  protected async writeFile(path: string, data: Readable | Buffer | string): Promise<void> {
    await this.webdavClient().putFileContents(path, data);
  }

  protected removeFile(path: string): Promise<void> {
    return this.webdavClient().deleteFile(path);
  }

  protected removeDirRecursive(path: string): Promise<void> {
    return this.webdavClient().deleteFile(path);
  }

  private webdavClient() {
    const { host, username, password } = this.config;
    return createClient(host, {
      username,
      password,
      maxBodyLength: 1024 * 1024 * 1024 * 1024,
      maxContentLength: 1024 * 1024 * 1024 * 1024,
    });
  }

  private parseFileInfo(fileStat: FileStat): FileInfo {
    return {
      filename: fileStat.basename,
      path: fileStat.filename,
      type: fileStat.type,
      mime: fileStat.mime,
      size: fileStat.size,
      lastModified: fileStat.lastmod,
    };
  }

  private parseError(e: any): WebdavError | undefined {
    try {
      const response = e["response"];
      return {
        status: checkNull(e["status"]),
        statusText: checkNull(response["statusText"]),
        message: checkNull(e["message"]),
        stack: checkNull(e["stack"]),
      }
    } catch (e) {
      return undefined;
    }
  }
}
