# UniFS

Unified file system binding specification

```ts
function readFile(fs: FileSystem, path: string): Promise<string> {
  return fs.readText(path)
}

function readS3File(): Promise<string> {
  const fs: FileSystem = new S3FileSystem();
  return readFile(fs, "foo/bar.txt");
}

function readFtpFile(): Promise<string> {
  const fs: FileSystem = new FtpFileSystem();
  return readFile(fs, "foo/bar.txt");
}
```
