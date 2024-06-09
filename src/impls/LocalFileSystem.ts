import {Readable} from "stream";
import path from "path";
import fs from "fs-extra";
import mime from "mime";
import {AbstractFileSystem} from "../AbstractFileSystem.js";
import {FileInfo} from "../fs_types.js";
import {getFilename} from "utils-js/path";
import {checkNull} from "utils-js/null";
import {FileNotFoundException} from "../errors.js";

interface LfsError {
  errno: number;
  code: string;
  message: string;
  stack: string;
}

export class LocalFileSystem extends AbstractFileSystem  {

  join(...chunks: string[]) {
    return path.resolve(...chunks);
  }

  async head(path: string) {
    try {
      const fileStat = await fs.stat(path);
      return this.parseFileInfo(fileStat, path);
    } catch (e) {
      const err = this.parseError(e);
      if (err !== undefined && err.code === "ENOENT") {
        throw new FileNotFoundException("not found file", err.stack);
      } else {
        throw e;
      }
    }
  }

  async list(path: string) {
    try {
      const filenames = await fs.promises.readdir(path);
      const promises = filenames
        .map(filename => this.join(path, filename))
        .map(filepath => this.head(filepath));
      return await Promise.all(promises);
    } catch (e) {
      const err = this.parseError(e);
      if (err !== undefined && err.code === "ENOENT") {
        throw new FileNotFoundException("not found directory", err.stack);
      } else {
        throw e;
      }
    }
  }

  ensureDir(path: string) {
    return fs.ensureDir(path);
  }

  protected getBuffer(path: string): Promise<Buffer> {
    return fs.readFile(path);
  }

  protected getReadable(path: string): Readable {
    return this.readStream(path);
  }

  readStream(path: string) {
    return fs.createReadStream(path);
  }

  async rename(src: string, dest: string, overwrite: boolean) {
    if (!overwrite) {
      if (await this.exists(dest)) {
        throw Error("file rename failed! dest already exists");
      }
    }
    return fs.rename(src, dest);
  }

  async copy(src: string, dest: string, overwrite: boolean) {
    if (!overwrite) {
      if (await this.exists(dest)) {
        throw Error("file rename failed! dest already exists");
      }
    }
    return fs.copy(src, dest);
  }

  protected async writeFile(path: string, data: Readable | Buffer | string): Promise<void> {
    if (data instanceof Readable) {
      const ws = fs.createWriteStream(path);
      await new Promise<void>((resolve, reject) => {
        data.pipe(ws);
        ws.on("close", () => resolve());
        ws.on("error", e => reject(e));
      });
    } else if (data instanceof Buffer) {
      await fs.writeFile(path, data);
    } else if (typeof data === "string") {
      await fs.writeFile(path, data);
    } else {
      throw Error("not supported data type");
    }
  }

  protected removeFile(path: string): Promise<void> {
    return fs.remove(path);
  }

  protected removeDirRecursive(path: string): Promise<void> {
    return fs.remove(path);
  }

  private parseFileInfo(fileStat: fs.Stats, path: string): FileInfo {
    return {
      filename: getFilename(path),
      path: path,
      type: fileStat.isDirectory() ? "directory" : "file",
      mime: mime.getType(path) ?? undefined,
      size: fileStat.size,
      lastModified: fileStat.mtime.toString(),
    };
  }

  private parseError(e: any): LfsError | undefined {
    try {
      return {
        errno: checkNull(e["errno"]),
        code: checkNull(e["code"]),
        message: checkNull(e["message"]),
        stack: checkNull(e["stack"]),
      }
    } catch (e) {
      return undefined;
    }
  }
}
