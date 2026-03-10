import {
  Controller,
  All,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { ExternalProxyService } from './external-proxy.service';
import { ExternalAuthGuard } from './guards/external-auth.guard';

/**
 * Catch-all proxy controller for external integrations.
 *
 * All requests to /ext/* are routed here.
 * The actual proxying is handled by ExternalProxyService.
 */
@Controller()
@UseGuards(ExternalAuthGuard)
export class ExternalProxyController {
  constructor(private readonly proxyService: ExternalProxyService) {}

  @All('*')
  async proxy(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const result = await this.proxyService.handleRequest(req);

    // Set response headers
    for (const [key, value] of Object.entries(result.headers)) {
      res.setHeader(key, value);
    }

    res.status(result.statusCode).json(result.body);
  }
}
