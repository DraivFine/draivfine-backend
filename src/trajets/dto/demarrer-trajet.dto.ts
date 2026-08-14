import { IsString } from 'class-validator';

export class DemarrerTrajetDto {
  @IsString()
  conducteurId: string;

  @IsString()
  vehiculeId: string;
}
