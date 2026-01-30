import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AllowedStudentsService } from '../allowed-students/allowed-students.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private allowedStudentsService: AllowedStudentsService,
  ) {}

  // 1. Validar Usuario (Login)
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

  // 2. Login (Generar Token)
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

  // 3. REGISTRO SEGURO (CORREGIDO)
  async register(createUserDto: CreateUserDto) {
    // A. Validaciones de Seguridad
    await this.allowedStudentsService.validateDocument(createUserDto.document_number);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    // B. RECUPERAR DATOS DE LA WHITELIST (Aquí estaba el faltante)
    // Necesitamos traer el registro completo para ver qué licencia tiene asignada
    const allowedData = await this.prisma.allowedStudent.findUnique({
      where: { document_number: createUserDto.document_number.trim() }
    });

    // C. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // D. Buscar Rol Estudiante
    const studentRole = await this.prisma.role.findUnique({ where: { name: 'student' } });
    if (!studentRole) throw new Error('El rol de estudiante no existe');
    
    // E. CREAR USUARIO + ASIGNAR LICENCIA
    const newUser = await this.prisma.user.create({
      data: {
        full_name: createUserDto.full_name,
        email: createUserDto.email,
        password_hash: hashedPassword,
        document_type: createUserDto.document_type,
        document_number: createUserDto.document_number,

        role_id: studentRole.id,
        student: {
          create: {
            // 👇 ESTA ES LA MAGIA: Si tenía licencia asignada, la conectamos
            license_categories: allowedData?.license_category_id ? {
               connect: { id: allowedData.license_category_id }
            } : undefined
          }
        }
      },
      include: {
        student: {
           include: { license_categories: true }
        }
      }
    });

    // F. MARCAR CÉDULA COMO USADA
    await this.allowedStudentsService.markAsRegistered(createUserDto.document_number);

    return newUser;
  }
}