import { Test, TestingModule } from '@nestjs/testing';
import { PixController } from './pix.controller';
import { PixService } from './pix.service';
import { FindAllPixQueryDto } from './dto/find-all-pix-query.dto';

describe('PixController', () => {
  let controller: PixController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PixController],
      providers: [PixService],
    }).compile();

    controller = module.get<PixController>(PixController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call findAll service with correct query parameters', async () => {
      const queryDto = new FindAllPixQueryDto();
      queryDto.txid = 'test-txid';
      const mockService = jest.spyOn(controller['pixService'], 'findAll').mockResolvedValue([]);
      const result = await controller.findAll(queryDto);
      expect(mockService).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual([]);
    });
    // Adicione mais casos de teste conforme necessário, como validação de parâmetros
  });
});
