import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
    public canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        if (!request.headers.authorization) {
            return false;
        }

        const decodedToken = this.validateAccessToken(request.headers.authorization);

        return !!decodedToken;
    }

    public validateAccessToken(accessToken: string) {
        try {
            return jwt.verify(accessToken, process.env.SECRET);
        } catch (error) {
            const message = 'Token error: ' + (error.message || error.name);
            throw new HttpException(message, HttpStatus.FORBIDDEN);
        }
    }
}
