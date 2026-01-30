import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'; 
import { ApiTags, ApiOperation } from '@nestjs/swagger'; 
import { CreateUserDto } from '../users/dto/create-user.dto';

@ApiTags('Auth') 
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión y obtener Token' }) 
  async login(@Body() loginDto: LoginDto) { 
    
   
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo estudiante (Validando Lista Blanca)' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}