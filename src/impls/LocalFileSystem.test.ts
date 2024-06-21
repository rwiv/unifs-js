import {describe, it} from "vitest";
import {LocalFileSystem} from "./LocalFileSystem.js";
import path from "path";
import {getRootPath} from "utils-js/path";

function getAssetPath() {
  return path.resolve(getRootPath(), "assets");
}

describe("test", async () => {

  const fs = new LocalFileSystem();

  it("test fs", async () => {
    const p1 = fs.join(getRootPath(), "tests", "test_conf.json");
    const text = await fs.readText(p1);
    console.log(text);
  });

  it("test recursive delete", async () => {
    const dirPath = fs.join(getAssetPath(), "test", "recur");
    await fs.ensureDir(dirPath);
    await fs.write(fs.join(dirPath, "f1.txt"), "1", true);
    await fs.write(fs.join(dirPath, "f2.txt"), "2", true);

    const innerDir = fs.join(dirPath, "d1");
    await fs.ensureDir(innerDir);
    await fs.write(fs.join(innerDir, "f1.txt"), "1", true);
    await fs.write(fs.join(innerDir, "f2.txt"), "2", true);

    await fs.remove(dirPath);
  });
});
