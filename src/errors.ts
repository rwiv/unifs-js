export class UnifsBaseException extends Error {
  constructor(
    msg: string,
    cause: string | undefined = undefined,
  ) {
    super(msg);
    if (cause !== undefined) {
      this.stack = this.stack + "\n" + cause;
    }
  }
}

export class FileNotFoundException extends UnifsBaseException {
  constructor(msg: string, cause: string | undefined = undefined) {
    super(msg, cause);
  }
}
