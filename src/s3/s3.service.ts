import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectVersionsCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'node:stream';
import { Logger } from '@nestjs/common';
import { BucketDto } from './dto/bucket.dto';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name, { timestamp: true });

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.MINIO_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      },
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000', // MinIO ou AWS
      forcePathStyle: true, // Necessário para MinIO
    });
  }

  async uploadFile(
    bucketName: BucketDto,
    fileName: string,
    fileTipe: string,
    fileBuffer: Buffer,
  ) {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: fileTipe,
    });

    return await this.s3Client.send(command);
  }

  async getFileUrl(bucketName: BucketDto, fileName: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return url.split('?')[0];
    } catch (error) {
      this.logger.error('Erro ao enviar log para Discord:', error);
      throw new HttpException('Arquivo nao encontrado', HttpStatus.NOT_FOUND);
    }
  }

  async deleteFile(bucketName: string, fileName: string) {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    return await this.s3Client.send(command);
  }

  async deleteAllFiles(bucketName: string, fileName: string) {
    const listVersionFiles = new ListObjectVersionsCommand({
      Bucket: bucketName,
      Prefix: fileName,
    });

    const { Versions } = await this.s3Client.send(listVersionFiles);

    if (!Versions || Versions.length === 0) {
      this.logger.error('Nenhuma versão encontrada para o arquivo:', fileName);
      return;
    }

    const List = [];

    for (const version of Versions) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        VersionId: version.VersionId,
      });

      const result = await this.s3Client.send(deleteCommand);
      List.push(result);
    }
  }

  async downloadFile(bucketName: string, fileName: string) {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    const result = await this.s3Client.send(command);
    return {
      buffer: await this.streamToBuffer(result.Body as Readable),
      ContentType: result.ContentType,
    };
  }

  async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async getAllFiles(bucketName: string) {
    //listar todos os arquivos do bucket
    const listVersionFiles = new ListObjectVersionsCommand({
      Bucket: bucketName,
    });
    const { Versions } = await this.s3Client.send(listVersionFiles);
    if (!Versions) {
      return null;
    }

    // separar por mimetype dos arquivos
    const pdf = [];
    const doc = [];
    const img = [];
    const video = [];
    const audio = [];

    for (const version of Versions) {
      if (version.Key.split('.').pop() === 'pdf') {
        pdf.push(version);
      } else if (
        version.Key.split('.').pop() === 'doc' ||
        version.Key.split('.').pop() === 'docx' ||
        version.Key.split('.').pop() === 'txt' ||
        version.Key.split('.').pop() === 'csv' ||
        version.Key.split('.').pop() === 'xls' ||
        version.Key.split('.').pop() === 'xlsx' ||
        version.Key.split('.').pop() === 'xml' ||
        version.Key.split('.').pop() === 'json'
      ) {
        doc.push(version);
      } else if (
        version.Key.split('.').pop() === 'jpg' ||
        version.Key.split('.').pop() === 'png' ||
        version.Key.split('.').pop() === 'jpeg' ||
        version.Key.split('.').pop() === 'gif' ||
        version.Key.split('.').pop() === 'webp' ||
        version.Key.split('.').pop() === 'svg'
      ) {
        img.push(version);
      } else if (version.Key.split('.').pop() === 'mp3') {
        audio.push(version);
      }
    }

    const GeradorUrl = async (version: any) => {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: version.Key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return url.split('?')[0];
    };

    const urlPdf = pdf.map(async (version) => {
      return {
        url: await GeradorUrl(version),
        name: version.Key.split('.')[0],
      };
    });
    const urlDoc = doc.map(async (version) => {
      return {
        url: await GeradorUrl(version),
        name: version.Key.split('.')[0],
      };
    });
    const urlImg = img.map(async (version) => {
      return {
        url: await GeradorUrl(version),
        name: version.Key.split('.')[0],
      };
    });
    const urlAudio = audio.map(async (version) => {
      return {
        url: await GeradorUrl(version),
        name: version.Key.split('.')[0],
      };
    });

    const lista = {
      pdf: (await Promise.all(urlPdf)) ?? [],
      doc: (await Promise.all(urlDoc)) ?? [],
      img: (await Promise.all(urlImg)) ?? [],
      video: [],
      audio: (await Promise.all(urlAudio)) ?? [],
    };

    return lista;
  }
}
