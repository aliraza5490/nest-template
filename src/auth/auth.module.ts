import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthToken } from "./entities/AuthToken.entity";
import { TokenService } from "./token.service";
import { User } from "./entities/User.entity";
import { AuthTokenSubscriber } from "./subscribers/AuthToken.subscriber";

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthToken, User]),
    JwtModule.registerAsync({
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "defaultSecret",
        signOptions: { expiresIn: "1h" },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, AuthTokenSubscriber],
})
export class AuthModule {}
