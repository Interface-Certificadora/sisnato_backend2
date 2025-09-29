import { Test, TestingModule } from '@nestjs/testing';
import { IntelesignController } from './intelesign.controller';
import { IntelesignService } from './intelesign.service';

describe('IntelesignController', () => {
  let controller: IntelesignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntelesignController],
      providers: [IntelesignService],
    }).compile();

    controller = module.get<IntelesignController>(IntelesignController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
