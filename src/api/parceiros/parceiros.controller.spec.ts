import { Test, TestingModule } from '@nestjs/testing';
import { ParceirosController } from './parceiros.controller';
import { ParceirosService } from './parceiros.service';

describe('ParceirosController', () => {
  let controller: ParceirosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParceirosController],
      providers: [ParceirosService],
    }).compile();

    controller = module.get<ParceirosController>(ParceirosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
