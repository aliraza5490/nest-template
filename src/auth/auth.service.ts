import { comparePassword, generatePasswordHash } from "@/shared/utils/bcrypt";
import { MailService } from "@/shared/mail/mail.service";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  EmailVerificationInput,
  LoginInput,
  RegistrationInput,
  RequestResetPasswordInput,
  ResetPasswordInput,
  ValidateEmailInput,
  VerifyEmailInput,
} from "./dto/auth.dto";
import { TokenService } from "./token.service";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async register(input: RegistrationInput) {
    const userExist = await this.userRepository.findOne({
      where: { email: input.email },
    });
    if (userExist && userExist.isEmailVerified) {
      throw new ConflictException("Email already in use");
    }

    if (userExist && !userExist.isEmailVerified) {
      await this.userRepository.delete({ email: input.email });
    }

    const user = this.userRepository.create({
      email: input.email,
      password: generatePasswordHash(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
    });
    await this.userRepository.save(user);

    const emailVerificationToken =
      await this.tokenService.signEmailVerificationToken(user.email);
    await this.mailService.sendVerificationMail({
      email: user.email,
      firstName: user.firstName,
      token: emailVerificationToken,
    });
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });
    if (!user) {
      throw new UnauthorizedException("Invalid Credentials");
    }

    if (!user.isEmailVerified) {
      throw new ForbiddenException("Email not verified");
    }

    const { password, ...userWithoutPassword } = user;

    if (!comparePassword(password, input.password)) {
      throw new UnauthorizedException("Invalid Credentials");
    }

    const tokens = await this.tokenService.signAuthTokens(
      user,
      input.rememberMe,
    );

    return { ...tokens, user: userWithoutPassword };
  }

  async requestResetPassword(input: RequestResetPasswordInput) {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const token = await this.tokenService.signResetPasswordToken(input.email);
    await this.mailService.sendResetPasswordMail({
      email: input.email,
      firstName: user.firstName,
      token,
    });
  }

  async resetPassword(input: ResetPasswordInput) {
    const email = await this.tokenService.verifyResetPasswordToken(input.token);
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    user.password = generatePasswordHash(input.password);
    await this.userRepository.save(user);

    await this.mailService.sendResetPasswordSuccessMail({
      email,
      firstName: user.firstName,
    });
  }

  async validateEmail(input: ValidateEmailInput) {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });

    return { exist: !!user };
  }

  async verifyEmail(input: VerifyEmailInput) {
    const email = await this.tokenService.verifyEmailVerificationToken(
      input.token,
    );
    await this.userRepository.update({ email }, { isEmailVerified: true });

    return { message: "Congratulation, your email verified successfully" };
  }

  async sendEmailVerification(input: EmailVerificationInput) {
    const user = await this.userRepository.findOne({
      where: { email: input.email },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.isEmailVerified) {
      throw new BadRequestException("Email already verified");
    }

    const token = await this.tokenService.signEmailVerificationToken(
      user.email,
    );

    await this.mailService.sendVerificationMail({
      email: user.email,
      firstName: user.firstName,
      token,
    });
  }
}
