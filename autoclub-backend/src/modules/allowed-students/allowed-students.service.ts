import { 
  Injectable, 
  ConflictException, 
  ForbiddenException 
} from '@nestjs/common';
import { CreateAllowedStudentDto } from './dto/create-allowed-student.dto';
import { UpdateAllowedStudentDto } from './dto/update-allowed-student.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AllowedStudentsService {
  constructor(private prisma: PrismaService) {}

  // 1. CREAR UNO SOLO
  async create(createAllowedStudentDto: CreateAllowedStudentDto) {
    const cleanDocument = createAllowedStudentDto.document_number.trim();

    const exists = await this.prisma.allowedStudent.findUnique({
      where: { document_number: cleanDocument },
    });

    if (exists) {
      throw new ConflictException('Esta cédula ya está en la lista de admitidos.');
    }

    return await this.prisma.allowedStudent.create({
      data: {
        ...createAllowedStudentDto,
        document_number: cleanDocument
      },
    });
  }

  // 2. CARGA MASIVA INTELIGENTE 🧠
  async createBatch(data: { document_number: string | number; license_name?: string }[]) {
    const results: { success: number; errors: string[] } = { success: 0, errors: [] };

    // A. TRAER TODAS LAS LICENCIAS A MEMORIA (Es más rápido y permite búsqueda flexible)
    const allLicenses = await this.prisma.licenseCategory.findMany();

    for (const item of data) {
      try {
        if (!item.document_number) continue;

        // Limpieza de Cédula
        const cleanDocument = item.document_number.toString().trim(); 

        let licenseId: number | null = null;

        // B. BÚSQUEDA INTELIGENTE DE LICENCIA
        if (item.license_name) {
          const excelLicense = item.license_name.toString().trim().toLowerCase();
          
          // Buscamos en el array de licencias alguna que COINCIDA o CONTENGA el texto
          const foundLicense = allLicenses.find(lic => {
            const dbName = lic.name.toLowerCase();
            // 1. Coincidencia exacta (ej: "a2" == "a2")
            if (dbName === excelLicense) return true;
            // 2. Excel contiene DB (ej: Excel "Licencia A2" contiene DB "A2")
            if (excelLicense.includes(dbName)) return true;
            // 3. DB contiene Excel (ej: DB "Categoria B1" contiene Excel "B1")
            if (dbName.includes(excelLicense)) return true;
            return false;
          });

          if (foundLicense) {
            licenseId = foundLicense.id;
          } else {
            // Opcional: Avisar en logs si no se encontró licencia pero venía escrita
            console.warn(`⚠️ No se encontró licencia para: ${excelLicense}`);
          }
        }

        // C. Guardar en Base de Datos
        await this.prisma.allowedStudent.upsert({
          where: { document_number: cleanDocument },
          update: { 
            license_category_id: licenseId 
          },
          create: {
            document_number: cleanDocument,
            license_category_id: licenseId
          }
        });
        
        results.success++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Error desconocido';
        results.errors.push(`Error con ${item.document_number}: ${msg}`);
      }
    }

    return results;
  }

  // 3. VALIDACIÓN
  async validateDocument(document_number: string): Promise<boolean> {
    const cleanDocument = document_number.toString().trim();

    const allowed = await this.prisma.allowedStudent.findUnique({
      where: { document_number: cleanDocument },
    });

    if (!allowed) {
      throw new ForbiddenException(
        '❌ Tu cédula no aparece en la lista de admitidos. Contacta a administración.',
      );
    }

    if (allowed.is_registered) {
      throw new ConflictException(
        '⚠️ Esta cédula ya ha sido registrada previamente.',
      );
    }

    return true;
  }

  // 4. MARCAR COMO REGISTRADO
  async markAsRegistered(document_number: string) {
    const cleanDocument = document_number.toString().trim();
    return await this.prisma.allowedStudent.update({
      where: { document_number: cleanDocument },
      data: { is_registered: true },
    });
  }

  // --- CRUD Estándar ---
  findAll() {
    return this.prisma.allowedStudent.findMany({
      orderBy: { created_at: 'desc' },
      include: { license_category: true } // Para ver el nombre de la licencia en el dashboard
    });
  }

  findOne(id: number) {
    return this.prisma.allowedStudent.findUnique({ where: { id } });
  }

  update(id: number, updateAllowedStudentDto: UpdateAllowedStudentDto) {
    return this.prisma.allowedStudent.update({
      where: { id },
      data: updateAllowedStudentDto,
    });
  }

  remove(id: number) {
    return this.prisma.allowedStudent.delete({ where: { id } });
  }
}