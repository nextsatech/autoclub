import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. Validar Usuario
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { 
        role: true,
       student: { 
          include: { license_categories: true } 
        }
      },
    });

    if (user && (await bcrypt.compare(pass, user.password_hash))) {
  
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role.name };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        document_type: user.document_type,
        document_number: user.document_number,
        
        student: user.student, 

        role: { 
          id: user.role.id,
          name: user.role.name 
        }
      }
    };
  }
}