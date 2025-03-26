import { Test, TestingModule } from '@nestjs/testing';
import { ConstrutoraController } from './construtora.controller';
import { ConstrutoraService } from './construtora.service';

describe('ConstrutoraController', () => {
  let controller: ConstrutoraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConstrutoraController],
      providers: [ConstrutoraService],
    }).compile();

    controller = module.get<ConstrutoraController>(ConstrutoraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
