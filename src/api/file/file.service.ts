import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllVideos() {
    const videos = await this.prisma.videosFaq.findMany();
    return videos ?? [];
  }

  async getSisnatoVideos() {
    const videos = await this.prisma.videosFaq.findMany({
      where: {
        tag: 'faq',
      },
    });
    console.log(videos);
    return videos ?? [];
  }
}
