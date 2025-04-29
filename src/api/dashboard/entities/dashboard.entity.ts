import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ContagemItem {
  @ApiResponseProperty()
  @Expose()
  ano: number;

  @ApiResponseProperty()
  @Expose()
  mes: number;

  @ApiResponseProperty()
  @Expose()
  total: number;

  @ApiResponseProperty({ type: [Number] })
  @Expose()
  solicitacoes: number[];

  @ApiResponseProperty()
  @Expose()
  mediaHoras: string;

  @ApiResponseProperty()
  @Expose()
  videoConferencia: number;

  @ApiResponseProperty()
  @Expose()
  interna: number;

  @ApiResponseProperty()
  @Expose()
  RG: number;

  @ApiResponseProperty()
  @Expose()
  CNH: number;
}

// Classe para cada tag
export class TagItem {
  @ApiResponseProperty()
  @Expose()
  descricao: string;

  @ApiResponseProperty()
  @Expose()
  quantidade: number;
}

// Classe para a estrutura de tags
export class Tags {
  @ApiResponseProperty()
  @Expose()
  total_tags: number;

  @ApiResponseProperty({ type: [TagItem] })
  @Expose()
  @Type(() => TagItem)
  lista_tags: TagItem[];
}

export class Dashboard {
  @ApiResponseProperty({ type: [ContagemItem] })
  @Expose()
  @Type(() => ContagemItem)
  contagem: ContagemItem[];

  @ApiResponseProperty({ type: Tags })
  @Expose()
  @Type(() => Tags)
  tags: Tags;

  constructor(partial: Partial<Dashboard>) {
    Object.assign(this, partial);
  }
}
