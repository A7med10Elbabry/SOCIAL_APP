

export abstract class ApplicationException extends Error {

    constructor(message: string, public statusCode: number, cause: unknown) {
        super(message, { cause })
        this.name = this.constructor.name
        // safety check for old versions
        Error.captureStackTrace(this, this.constructor)
    }
}


