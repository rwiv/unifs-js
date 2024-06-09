export class UnifsBaseException extends Error {
    constructor(msg, cause = undefined) {
        super(msg);
        if (cause !== undefined) {
            this.stack = this.stack + "\n" + cause;
        }
    }
}
export class FileNotFoundException extends UnifsBaseException {
    constructor(msg, cause = undefined) {
        super(msg, cause);
    }
}
