import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, hashSync } from 'bcryptjs';
import { Repository } from 'typeorm';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async login(loginDTO: LoginDTO) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDTO.email },
    });
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = compareSync(loginDTO.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const token = this.jwtService.sign(
      { id: user.id, role: user.role },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: loginDTO.rememberMe ? '7d' : '1d',
      },
    );

    return {
      token,
    };
  }

  async register(registerDTO: RegisterDTO) {
    const userExists = await this.usersRepository.exists({
      where: { email: registerDTO.email },
    });

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    registerDTO.password = hashSync(registerDTO.password, 10);

    await this.usersRepository.save(registerDTO);

    return {
      message: 'User registered successfully',
    };
  }
}
