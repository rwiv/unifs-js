import {describe, it} from "vitest";
import fse from "fs-extra";
import path from "path";
import {WebdavConfig, WebdavFileSystem} from "./WebdavFileSystem.js";
import {streamToBuffer} from "utils-js/buffer";
import {getRootPath} from "utils-js/path";
import {FtpConfig} from "./FtpFileSystem.js";
import {LocalFileSystem} from "./LocalFileSystem.js";

export interface TestConf {
  baseDir: string,
  webdav: WebdavConfig;
  ftp: FtpConfig;
}

function getAssetPath() {
  return path.resolve(getRootPath(), "assets");
}

describe("test", async () => {

  const confPath = path.resolve(getRootPath(), "tests", "test_conf.json")
  const conf: TestConf = JSON.parse(await new LocalFileSystem().readText(confPath));
  const fs = new WebdavFileSystem(conf.webdav);

  it("test", () => {
    console.log(conf);
    console.log("hello")
  })

  it("test list", async () => {
    const res = await fs.list("/drive/test");
    console.log(res);
  });

  it("test ensureDir", async () => {
    const res = await fs.ensureDir("/drive/test/a");
    console.log(res);
  });

  it("test get 1", async () => {
    const { info, stream} = await fs.read("/drive/test/hello.txt");
    const ws = fse.createWriteStream(path.resolve(getAssetPath(), "test", info.filename));
    stream.pipe(ws);
  });

  it("test get 2", async () => {
    const { stream } = await fs.read("/drive/test/hello.txt");
    const buffer = await streamToBuffer(stream);
    const str = buffer.toString("utf-8");
    console.log(str);
  });

  it("test put", async () => {
    const rs = fse.createReadStream(path.resolve(getAssetPath(), "test", "captcha", "image.jpg"));
    const info = await fs.write("/drive/test/image.jpg", rs, true);
    console.log(info);
  });

  it("test put overwrite", async () => {
    const { stream } = await fs.read("/drive/test/hello.txt");
    const info = await fs.write("/drive/test/image.jpg", stream, false);
    console.log(info);
  });

  it("test delete", async () => {
    await fs.remove("/drive/test/haha");
  });
})

