import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface CachedResponse {
  status: number;
  body: any;
  timestamp: number;
}

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  private readonly cache = new Map<string, CachedResponse>();
  private readonly inFlight = new Set<string>();
  constructor() {
    setInterval(() => this.cleanupExpired(), CLEANUP_INTERVAL_MS);
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // Only apply to POST and PATCH methods
    if (req.method !== 'POST' && req.method !== 'PATCH') {
      next();
      return;
    }

    const idempotencyKey = req.headers['x-idempotency-key'] as string | undefined;

    // If no idempotency key header, pass through
    if (!idempotencyKey) {
      next();
      return;
    }

    // Check if we have a cached response for this key
    const cached = this.cache.get(idempotencyKey);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < TTL_MS) {
        // Return cached response
        res.status(cached.status).json(cached.body);
        return;
      }
      // Expired, remove it
      this.cache.delete(idempotencyKey);
    }

    // Check if this key is currently being processed
    if (this.inFlight.has(idempotencyKey)) {
      res.status(409).json({
        success: false,
        message: 'A request with this idempotency key is already being processed',
      });
      return;
    }

    // Mark as in-flight
    this.inFlight.add(idempotencyKey);

    // Intercept the response to cache it
    const originalJson = res.json.bind(res);
    res.json = (body: any): Response => {
      this.cache.set(idempotencyKey, {
        status: res.statusCode,
        body,
        timestamp: Date.now(),
      });
      this.inFlight.delete(idempotencyKey);
      return originalJson(body);
    };

    next();
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= TTL_MS) {
        this.cache.delete(key);
      }
    }
  }
}
