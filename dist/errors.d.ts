export declare class UnifsBaseException extends Error {
    constructor(msg: string, cause?: string | undefined);
}
export declare class FileNotFoundException extends UnifsBaseException {
    constructor(msg: string, cause?: string | undefined);
}
