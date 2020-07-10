import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserEntity } from './user.entity';
import { CredentialsDTO, UserRO, Tokens } from './user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>
    ) {}

    // ToDo: Test API. Shout be removed in production
    public async showAll(): Promise<UserRO[]> {
        const user = await this.userRepository.find();
        return user.map(user => user.toResponseObject());
    }

    public async login(data: CredentialsDTO): Promise<UserRO> {
        const { email, password } = data;
        const user = await this.userRepository.findOne({ where: { email } });
        const arePasswordsMatch = user && (await user.comparePassword(password));

        if (!arePasswordsMatch) {
            throw new HttpException('Invalid email/password', HttpStatus.FORBIDDEN);
        }

        return user.toResponseObject(true);
    }

    // ToDo: Test API. Shout be removed in production
    public async register(data: CredentialsDTO): Promise<UserRO> {
        const { email } = data;
        const persistedUser = await this.userRepository.findOne({ where: { email } });

        if (persistedUser) {
            throw new HttpException('User already exists', HttpStatus.OK);
        }

        const user = this.userRepository.create(data);
        await this.userRepository.save(user);

        return user.toResponseObject(true);
    }

    public async refreshTokens(accessToken, refreshToken): Promise<Tokens> {
        if (!accessToken || !refreshToken) {
            throw new HttpException('Access token or refresh token is absent', HttpStatus.FORBIDDEN);
        }

        let decodedAccessToken: any;
        try {
            decodedAccessToken = jwt.verify(accessToken, process.env.SECRET, { ignoreExpiration: true });
        } catch (error) {
            const message = 'Token error: ' + (error.message || error.name);
            throw new HttpException(message, HttpStatus.FORBIDDEN);
        }

        const user = await this.userRepository.findOne({ where: { id: decodedAccessToken.id } });

        if (user.refreshToken !== refreshToken) {
            throw new HttpException('Invalid refresh token', HttpStatus.FORBIDDEN);
        }

        return {
            accessToken: user.accessToken,
            refreshToken: this.updateRefreshToken(user),
        };
    }

    private updateRefreshToken(user) {
        user.refreshToken = uuidv4();
        this.userRepository.save(user);

        return user.refreshToken;
    }
}
