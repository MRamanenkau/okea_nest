import { Controller, Post, Get, Body, Res, Req, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { UserService } from './user.service';
import { CredentialsDTO } from './user.dto';
import { AuthGuard } from '../shared/auth.guard';
import { REFRESH_TOKEN_COOKIE_MAX_AGE } from '../constants/appWide';

const refreshTokenCookieOptions = {
    maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
    httpOnly: false,
    path: '/',
    sameSite: 'none',
    secure: true,
};

@Controller()
export class UserController {
    constructor(private userService: UserService) {}

    @Get('user')
    @UseGuards(new AuthGuard())
    showAllUsers() {
        return this.userService.showAll();
    }

    @Post('login')
    @UsePipes(new ValidationPipe())
    async login(@Body() data: CredentialsDTO, @Res() res: Response) {
        const userData = await this.userService.login(data);

        res.cookie('okeaRefreshToken', userData.refreshToken, refreshTokenCookieOptions);

        delete userData.refreshToken;

        res.send(userData);
    }

    @Get('refresh-tokens')
    async refreshTokens(@Req() req: Request, @Res() res: Response) {
        const tokens = await this.userService.refreshTokens(req.headers.authorization, req.cookies?.okeaRefreshToken);
        res.cookie('okeaRefreshToken', tokens?.refreshToken, refreshTokenCookieOptions);

        res.send({ accessToken: tokens?.accessToken });
    }

    @Post('register')
    @UsePipes(new ValidationPipe())
    register(@Body() data: CredentialsDTO) {
        return this.userService.register(data);
    }
}
