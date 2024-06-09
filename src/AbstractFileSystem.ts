import {FileInfo, FileSystem} from "./types.js";
import {readableToBuffer} from "utils-js/buffer";
import {FileNotFoundException} from "./errors.js";
import {Readable} from "stream";

export abstract class AbstractFileSystem implements FileSystem {

  abstract head(path: string): Promise<FileInfo>;
  abstract list(path: string): Promise<FileInfo[]>;
  abstract ensureDir(path: string): Promise<void>;

  protected abstract getReadable(path: string): Readable;
  protected abstract writeFile(path: string, data: Readable | Buffer | string, overwrite: boolean): Promise<void>;
  protected abstract removeFile(path: string): Promise<void>;
  protected abstract removeDirRecursive(path: string): Promise<void>;

  async exists(path: string): Promise<boolean> {
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
  }

  public async readStream(path: string): Promise<Readable> {
    const info = await this.head(path);
    if (info.type === "directory") {
      throw Error("file is directory");
    }
    return this.getReadable(path);
  }

  async readBuffer(path: string): Promise<Buffer> {
    const rs = await this.readStream(path);
    return readableToBuffer(rs);
  }

  async readText(path: string): Promise<string> {
    const buffer = await this.readBuffer(path)
    return buffer.toString("utf-8");
  }

  join(...chunks: string[]) {
    return chunks.join("/");
  }

  public async write(path: string, data: Readable | Buffer | string, overwrite: boolean) {
    if (!overwrite) {
      if (await this.exists(path)) {
        throw Error("file write failed! file already exists");
      }
    }
    await this.writeFile(path, data, overwrite);
  }

  public async remove(path: string, recursive: boolean = true) {
    const info = await this.head(path);
    if (info.type === "file") {
      await this.removeFile(path);
    }
    const files = await this.list(path);
    if (files.length > 0) {
      if (!recursive) {
        throw Error("file exists in the directory")
      } else {
        await this.removeDirRecursive(path);
      }
    } else {
      await this.removeFile(path);
    }
    return info;
  }

  async findFilesRecursive(path: string) {
    const files: FileInfo[] = [];
    await this.fileTraverse(path, async file => {
      files.push(file);
    });
    return files;
  }

  async fileTraverse(path: string, fn: (file: FileInfo) => Promise<void>) {
    const root = await this.head(path);
    return this.fileTraverseRecursive(root, fn);
  }

  private async fileTraverseRecursive(file: FileInfo, fn: (file: FileInfo) => Promise<void>) {
    if (file.type === "file") {
      return await fn(file);
    }
    const files = await this.list(file.path);
    for (const file of files) {
      await this.fileTraverseRecursive(file, fn);
    }
  }
}
