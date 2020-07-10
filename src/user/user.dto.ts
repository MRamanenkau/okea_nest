import { IsNotEmpty } from 'class-validator';

export class CredentialsDTO {
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;
}

export interface UserRO {
    id: string;
    email: string;
    created: Date;
    accessToken?: string;
    refreshToken?: string;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}
