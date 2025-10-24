import { Logger, HttpException, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TagEntity } from './entities/tag.entity';
import { plainToClass } from 'class-transformer';
import { UserPayload } from 'src/auth/entities/user.entity';
import { LogService } from 'src/log/log.service';
import { SolicitacaoService } from '../solicitacao/solicitacao.service';

@Injectable()
export class TagService {
  constructor(
    private readonly Prisma: PrismaService,
    private Log: LogService,
    private Cliente: SolicitacaoService,
  ) {}
  private readonly logger = new Logger(TagService.name, { timestamp: true });

  /**
   * Creates a new tag in the database.
   *
   * @param {CreateTagDto} createTagDto - The data transfer object containing the details of the tag to be created.
   * @returns {Promise<TagEntity>} - A promise that resolves to the created TagEntity.
   * @throws {HttpException} - If an error occurs during the creation of the tag.
   */

  async create(
    createTagDto: CreateTagDto,
    User: UserPayload,
  ): Promise<TagEntity> {
    try {
      const res = await this.Prisma.tag.create({
        data: {
          descricao: createTagDto.descricao,
          solicitacao: createTagDto.solicitacao,
        },
      });

      const cliente = await this.Cliente.GetSolicitacaoById(
        createTagDto.solicitacao,
      );

      await this.Log.Post({
        User: User.id,
        EffectId: createTagDto.solicitacao,
        Rota: 'tag',
        Descricao: `O Usuario ${User.id}-${User.nome} criou a tag ${createTagDto.descricao} para a solicitacao ${createTagDto.solicitacao} - ${cliente.nome} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(TagEntity, res);
    } catch (error) {
      this.logger.error('Erro ao criar tag:', JSON.stringify(error, null, 2));
      throw new HttpException({ message: error.message }, 400);
    }
  }

  /**
   * Retrieves all tags from the database.
   *
   * Maps each tag to a TagEntity instance.
   *
   * @returns {Promise<TagEntity[]>} - A promise that resolves to an array of TagEntity objects.
   * @throws {HttpException} - If an error occurs during the retrieval process.
   */

  async findAll(): Promise<TagEntity[]> {
    try {
      const req = await this.Prisma.tag.findMany();
      return req.map((item: any) => plainToClass(TagEntity, item));
    } catch (error) {
      this.logger.error('Erro ao buscar tags:', JSON.stringify(error, null, 2));
      throw new HttpException({ message: error.message }, 400);
    }
  }

  /**
   * Retrieves a single tag by its ID from the database.
   *
   * @param {number} id - The ID of the tag to retrieve.
   * @returns {Promise<TagEntity>} - A promise that resolves to a TagEntity object.
   * @throws {HttpException} - If an error occurs during the retrieval process.
   */
  async findOne(id: number): Promise<TagEntity> {
    try {
      const req = await this.Prisma.tag.findUnique({
        where: { id },
        include: { solicitacaoData: true },
      });
      return plainToClass(TagEntity, req);
    } catch (error) {
      this.logger.error('Erro ao buscar tag:', JSON.stringify(error, null, 2));
      throw new HttpException({ message: error.message }, 400);
    }
  }

  /**
   * Retrieves all tags associated with a specific solicitacao.
   *
   * Maps each tag to a TagEntity instance.
   *
   * @param {number} id - The ID of the solicitacao for which to retrieve tags.
   * @returns {Promise<TagEntity[]>} - A promise that resolves to an array of TagEntity objects.
   * @throws {HttpException} - If an error occurs during the retrieval process.
   */

  async findSolicitacaoAll(id: number) {
    const req = await this.Prisma.tag.findMany({
      where: { solicitacao: id },
    });
    if (!req) {
      this.logger.warn(
        'Nenhuma tag encontrada para a solicitacao:',
        id +
          ' - ' +
          new Date().toLocaleDateString('pt-BR') +
          ' as ' +
          new Date().toLocaleTimeString('pt-BR'),
      );
      this.logger.warn('Nenhuma tag encontrada:', JSON.stringify(req, null, 2));
      return [];
    }
    return req.map((item: any) => plainToClass(TagEntity, item));
  }

  /**
   * Updates a tag in the database.
   *
   * @param {number} id - The ID of the tag to update.
   * @param {UpdateTagDto} updateTagDto - The data transfer object containing the updated details of the tag.
   * @returns {Promise<TagEntity>} - A promise that resolves to the updated TagEntity.
   * @throws {HttpException} - If an error occurs during the update process.
   */
  async update(
    id: number,
    updateTagDto: UpdateTagDto,
    User: UserPayload,
  ): Promise<TagEntity> {
    try {
      const req = await this.Prisma.tag.update({
        where: { id },
        data: {
          descricao: updateTagDto.descricao,
        },
      });

      const cliente = await this.Cliente.findOne(req.solicitacao, User);

      await this.Log.Post({
        User: User.id,
        EffectId: cliente.id,
        Rota: 'tag',
        Descricao: `O Usuario ${User.id}-${User.nome} atualizou a tag ${req.id} para o cliente ${cliente.id} - ${cliente.nome} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });
      return plainToClass(TagEntity, req);
    } catch (error) {
      this.logger.error(
        'Erro ao atualizar tag:',
        JSON.stringify(error, null, 2),
      );
      throw new HttpException({ message: error.message }, 400);
    }
  }

  /**
   * Removes a tag from the database by its ID.
   *
   * @param {number} id - The ID of the tag to be removed.
   * @returns {Promise<{ message: string }>} - A promise that resolves to a success message.
   * @throws {HttpException} - If an error occurs during the removal process.
   */
  async remove(id: number, User: UserPayload): Promise<{ message: string }> {
    try {
      const Tag = await this.findOne(id);
      await this.Prisma.tag.delete({
        where: { id },
      });

      const cliente = await this.Cliente.findOne(Tag.solicitacao, User);

      await this.Log.Post({
        User: User.id,
        EffectId: cliente.id,
        Rota: 'tag',
        Descricao: `O Usuario ${User.id}-${User.nome} deletou a tag ${id} para o cliente ${cliente.id} - ${cliente.nome} - ${new Date().toLocaleDateString('pt-BR')} as ${new Date().toLocaleTimeString('pt-BR')}`,
      });

      return { message: 'Tag excluida com sucesso' };
    } catch (error) {
      this.logger.error('Erro ao deletar tag:', JSON.stringify(error, null, 2));
      throw new HttpException({ message: error.message }, 400);
    }
  }
}
