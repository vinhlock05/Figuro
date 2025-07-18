import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import chalk from 'chalk'

const divider = chalk.gray('='.repeat(52))

export const responseLogger = (req: AuthRequest, res: Response, next: NextFunction) => {
    const start = Date.now()
    const originalSend = res.send

    res.send = function (body?: any): Response {
        const duration = Date.now() - start
        const status = res.statusCode
        const method = req.method
        const url = req.originalUrl
        const user = req.user ? `${req.user.role === 'admin' ? '👑' : '👤'} userId=${req.user.userId} role=${req.user.role}` : '👥 guest'
        let statusColor = chalk.green
        let statusEmoji = '🟢'
        if (status >= 500) { statusColor = chalk.red; statusEmoji = '🔴' }
        else if (status >= 400) { statusColor = chalk.yellow; statusEmoji = '🟡' }
        else if (status >= 300) { statusColor = chalk.cyan; statusEmoji = '🔵' }
        const methodColor = method === 'GET' ? chalk.blue : method === 'POST' ? chalk.green : method === 'PUT' ? chalk.yellow : method === 'DELETE' ? chalk.red : chalk.white
        const now = new Date().toISOString()
        let log = `\n${divider}\n${chalk.bold('[API RESPONSE]')}`
        log += `\n${chalk.bold('Status   :')} ${statusColor(status)} ${statusEmoji}`
        log += `\n${chalk.bold('Method   :')} ${methodColor(method)}`
        log += `\n${chalk.bold('URL      :')} ${chalk.white(url)}`
        log += `\n${chalk.bold('User     :')} ${user}`
        log += `\n${chalk.bold('Duration :')} ${chalk.magenta(duration + 'ms')}`
        log += `\n${chalk.bold('Time     :')} ${chalk.gray(now)}`
        log += `\n${chalk.gray('-'.repeat(50))}`
        if (body) {
            let prettyBody = body
            try {
                prettyBody = typeof body === 'string' ? JSON.parse(body) : body
                prettyBody = JSON.stringify(prettyBody, null, 2)
            } catch { /* leave as is */ }
        }
        log += `\n${divider}\n`
        console.log(log)
        // @ts-ignore
        return originalSend.call(this, body)
    }

    next()
} 