import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactUrgenceDto } from './dto/create-contact-urgence.dto';
import { UpdateContactUrgenceDto } from './dto/update-contact-urgence.dto';

@Injectable()
export class ContactsUrgenceService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateContactUrgenceDto) {
    // Le contact se rattache soit à un passager, soit à un conducteur — les
    // deux colonnes sont nullables sur le modèle mais un contact orphelin ou
    // à double appartenance n'a pas de sens métier.
    if (!dto.passagerId === !dto.conducteurId) {
      throw new BadRequestException('Fournir exactement un passagerId ou un conducteurId');
    }
    return this.prisma.contactUrgence.create({ data: dto });
  }

  findAll(passagerId?: string, conducteurId?: string) {
    return this.prisma.contactUrgence.findMany({
      where: { passagerId, conducteurId },
    });
  }

  async findOne(id: string) {
    const contact = await this.prisma.contactUrgence.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException("Contact d'urgence introuvable");
    return contact;
  }

  async update(id: string, dto: UpdateContactUrgenceDto) {
    await this.findOne(id);
    return this.prisma.contactUrgence.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.contactUrgence.delete({ where: { id } });
  }
}
