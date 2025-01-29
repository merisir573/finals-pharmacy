import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PharmacyController } from './pharmacy/pharmacy.controller';
import { PharmacyService } from './pharmacy/pharmacy.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './pharmacy/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'secret-key', // Same as auth-service
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AppController, PharmacyController],
  providers: [AppService, PharmacyService, JwtStrategy],
})
export class AppModule {}
