import fs from 'fs';
import path from 'path';
import { NextFunction, Request, Response } from 'express';

const requestLogPath = path.join(process.cwd(), 'request.log');
const errorLogPath = path.join(process.cwd(), 'error.log');

function appendJson(filePath: string, data: Record<string, unknown>) {
  fs.appendFileSync(filePath, `${JSON.stringify(data)}\n`, 'utf8');
}

export default function requestResponseLogger(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();
  let capturedBody: unknown;

  const originalSend = res.send;
  res.send = function sendInterceptor(this: Response, body?: unknown) {
    capturedBody = body;
    return originalSend.call(this, body as never);
  };

  res.on('finish', () => {
    const base: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt,
    };
    appendJson(requestLogPath, base);
    if (res.statusCode >= 400) {
      let message: string | undefined;
      if (capturedBody && typeof capturedBody === 'object' && capturedBody !== null && 'message' in capturedBody) {
        message = String((capturedBody as { message: unknown }).message);
      } else if (typeof capturedBody === 'string') {
        try {
          const parsed = JSON.parse(capturedBody) as { message?: string };
          message = parsed.message;
        } catch {
          message = capturedBody;
        }
      }
      appendJson(errorLogPath, { ...base, message });
    }
  });

  next();
}
