import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // 👇 ESTO ES LO QUE TE FALTA:
      usernameField: 'email', 
      passwordField: 'password', // (Opcional, por defecto es 'password')
    });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log(`🔍 Intentando login con: ${email}`); // Debug para ver si entra

    const user = await this.authService.validateUser(email, password);
    if (!user) {
      console.log('❌ Usuario no encontrado o contraseña incorrecta');
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    
    console.log('Login exitoso para:', user.email);
    return user;
  }
}