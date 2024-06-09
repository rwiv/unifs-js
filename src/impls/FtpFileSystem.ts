import {Client} from "basic-ftp";
import {FileInfo as FileStat} from "basic-ftp";
import mime from "mime";
import {AbstractFileSystem} from "../AbstractFileSystem.js";
import {getDirPath, getFilename} from "utils-js/path";
import {first} from "utils-js/array";
import {toBuffer} from "utils-js/buffer";
import {PassThrough} from "node:stream";
import {Readable} from "stream";
import {FileInfo} from "../fs_types.js";
import {checkNull} from "utils-js/null";
import {FileNotFoundException} from "../common/errors.js";

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

export class FtpFileSystem extends AbstractFileSystem {

  constructor(public readonly config: FtpConfig) {
    super();
  }

  exists = (path: string) => this.connect(async client => {
    try {
      await this.head(path);
      return true;
    } catch (e) {
      if (e instanceof FileNotFoundException) {
        return false;
      } else {
        throw e;
      }
    }
  });

  head = (path: string) => this.connect(async client => {
    const children = await this.list(getDirPath(path, "/"));
    const info = first(children, file => file.path === path);
    if (info === undefined) {
      throw new FileNotFoundException("not found file");
    }
    return info;
  });

  list = (path: string) => this.connect(async client => {
    try {
      const stats = await client.list(path);
      return stats.map(stat => this.parseFileInfo(stat, path));
    } catch (e) {
      const err = this.parseError(e);
      if (err !== undefined && err.code === 550) {
        throw new FileNotFoundException("not found file", err.stack);
      } else {
        throw e;
      }
    }
  });

  ensureDir = (path: string) => this.connect(async client => {
    return client.ensureDir(path);
  });

  protected getBuffer = (path: string) => this.connect(async client => {
    const rs = this.getReadable(path);
    return toBuffer(rs);
  });

  protected getReadable(path: string) {
    const stream = new PassThrough();
    const { host, port, user, password } = this.config;
    const client = new Client();
    client.access({ host, port, user, password }).then(async () => {
      await client.downloadTo(stream, path);
      client.close();
    });
    return stream;
  }

  protected writeFile = (path: string, data: Readable | Buffer | string) => this.connect(async client => {
    if (data instanceof Buffer) {
      await client.uploadFrom(Readable.from(data), path);
    } else if (typeof data === "string") {
      await client.uploadFrom(Readable.from(data), path);
    } else if (data instanceof Readable) {
      await client.uploadFrom(data, path)
    } else {
      throw Error("not supported data type");
    }
  });

  protected removeFile = (path: string) => this.connect(async client => {
    await client.remove(path);
  });

  protected removeDirRecursive = (path: string) => this.connect(async client => {
    await client.removeDir(path);
  });

  private async connect<T>(fn: (client: Client) => Promise<T>) {
    const { host, port, user, password } = this.config;
    const client = new Client();

    try {
      await client.access({ host, port, user, password });
      return await fn(client);
    } catch (e) {
      throw e;
    } finally {
      client.close();
    }
  }

  private parseFileInfo(stat: FileStat, dirPath: string): FileInfo {
    return {
      filename: getFilename(stat.name),
      path: dirPath + "/" + stat.name.replace(dirPath, ""),
      type: stat.type === 2 ? "directory" : "file",
      mime: mime.getType(stat.name) ?? undefined,
      size: stat.size,
      lastModified: stat.modifiedAt?.toString(),
    };
  }

  private parseError(e: any): FtpError | undefined {
    try {
      return {
        name: checkNull(e["name"]),
        code: checkNull(e["code"]),
        stack: checkNull(e["stack"]),
        message: checkNull(e["message"]),
      }
    } catch (e) {
      return undefined;
    }
  }
}
