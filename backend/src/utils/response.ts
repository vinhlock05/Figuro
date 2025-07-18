import { Response } from 'express'

export function sendResponse(
    res: Response,
    statusCode: number,
    message: string,
    data?: any
) {
    return res.status(statusCode).json({
        statusCode,
        message,
        ...(data !== undefined ? { data } : {})
    })
}

export function sendError(
    res: Response,
    statusCode: number,
    message: string,
    error?: any
) {
    return res.status(statusCode).json({
        statusCode,
        message,
        ...(error ? { error } : {})
    })
} 