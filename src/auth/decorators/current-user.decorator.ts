import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../strategies/jwt.strategy';

// Peuplé par JwtStrategy.validate() via JwtAuthGuard — n'utiliser que sur
// des routes gardées par @UseGuards(JwtAuthGuard).
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JwtPayload => {
  return ctx.switchToHttp().getRequest().user;
});
