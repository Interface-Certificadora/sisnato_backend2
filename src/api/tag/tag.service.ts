import { HttpException, Injectable } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TagEntity } from './entities/tag.entity';
import { plainToClass } from 'class-transformer';

@Injectable()
export class TagService {
  constructor(private readonly Prisma: PrismaService) {}

  /**
   * Creates a new tag in the database.
   *
   * @param {CreateTagDto} createTagDto - The data transfer object containing the details of the tag to be created.
   * @returns {Promise<TagEntity>} - A promise that resolves to the created TagEntity.
   * @throws {HttpException} - If an error occurs during the creation of the tag.
   */

  async create(createTagDto: CreateTagDto): Promise<TagEntity> {
    try {
      const res = await this.Prisma.tag.create({
        data: {
          descricao: createTagDto.descricao,
          solicitacao: createTagDto.solicitacao,
        },
      });
      return plainToClass(TagEntity, res);
    } catch (error) {
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
      throw new HttpException({ message: error.message }, 400);
    }
  }

  /**
   * Updates a tag in the database.
   *
   * @param {number} id - The ID of the tag to update.
   * @param {UpdateTagDto} updateTagDto - The data transfer object containing the updated details of the tag.
   * @returns {Promise<TagEntity>} - A promise that resolves to the updated TagEntity.
   * @throws {HttpException} - If an error occurs during the update process.
   */
  async update(id: number, updateTagDto: UpdateTagDto): Promise<TagEntity> {
    try {
      const req = await this.Prisma.tag.update({
        where: { id },
        data: {
          descricao: updateTagDto.descricao,
        },
      });
      return plainToClass(TagEntity, req);
    } catch (error) {
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
  async remove(id: number): Promise<{ message: string; }> {
    try {
      await this.Prisma.tag.delete({
        where: { id },
      });
      return { message: 'Tag excluida com sucesso' };
    } catch (error) {
      throw new HttpException({ message: error.message }, 400);
    }
  }
}
