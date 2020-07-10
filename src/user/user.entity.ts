import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { UserRO } from './user.dto';
import { ACCESS_TOKEN_EXPIRES_IN } from '../constants/appWide';

@Entity('user')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @CreateDateColumn()
    public created: Date;

    @Column({
        type: 'varchar',
        unique: true,
    })
    public email: string;

    @Column('varchar')
    public password: string;

    @Column('text')
    public refreshToken: string;

    @BeforeInsert()
    public async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10);
    }

    @BeforeInsert()
    public async generateRefreshToken() {
        this.refreshToken = uuidv4();
    }

    public toResponseObject(shouldReturnTokens = false): UserRO {
        const { id, created, email, accessToken, refreshToken } = this;
        const responseObject: UserRO = { id, created, email };

        if (shouldReturnTokens) {
            responseObject.accessToken = accessToken;
            responseObject.refreshToken = refreshToken;
        }

        return responseObject;
    }

    public async comparePassword(attempt: string): Promise<boolean> {
        return await bcrypt.compare(attempt, this.password);
    }

    public get accessToken() {
        const { id, email } = this;

        return jwt.sign({ id, email }, process.env.SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
    }
}
