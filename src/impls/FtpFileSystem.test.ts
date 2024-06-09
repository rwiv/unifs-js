import {describe, it} from "vitest";
import {FtpConfig, FtpFileSystem} from "./FtpFileSystem.js";
import {WebdavConfig} from "./WebdavFileSystem.js";
import path from "path";
import {rootPath} from "utils-js/path";
import {LocalFileSystem} from "./LocalFileSystem.js";

export interface TestConf {
  baseDir: string,
  webdav: WebdavConfig;
  ftp: FtpConfig;
}

describe("test", async () => {

  const confPath = path.resolve(rootPath(), "tests", "test_conf.json")
  const conf: TestConf = JSON.parse(await new LocalFileSystem().readToString(confPath));
  const ftp = new FtpFileSystem(conf.ftp);

  it("test ftp", async () => {
    const res = await ftp.head("/drive/test/hello.txt");
    console.log(res);
  });

  it("test write", async () => {
    await ftp.write("/drive/test/test1.txt", "hello", true);
  });
})
