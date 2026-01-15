import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service'; 
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. Validar que el usuario existe y la contraseña es correcta
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { role: true }, // Traemos el rol para saber quién es
    });

    if (user && (await bcrypt.compare(pass, user.password_hash))) {
      const { password_hash, ...result } = user; 
      return result;
    }
    return null;
  }

  // 2. Generar el Token de acceso (Login)
  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role.name
      }
    };
  }
}