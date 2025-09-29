import { BucketDto } from 'src/s3/dto/bucket.dto';
import { S3Service } from 'src/s3/s3.service';

export default async function saveOriginal(
  file: Express.Multer.File,
  originalname: string,
  size: number,
  mimetype: string,
  setor: BucketDto,
): Promise<{
  url_view: string;
  url_download: string;
  name: string;
  size: number;
  mimetype: string;
  setor: BucketDto;
  new_name: string;
}> {
  const s3: S3Service = new S3Service();
  const extension: string = originalname.split('.').pop();
  const newName: string = `${Date.now()}.${extension}`;

  await s3.uploadFile(setor, newName, mimetype, file.buffer);

  const response = {
    url_view: `${process.env.LOCAL_URL}/file/${setor}/${newName}`,
    url_download: `${process.env.LOCAL_URL}/file/download/${setor}/${newName}`,
    name: originalname,
    size,
    mimetype,
    setor,
    new_name: newName,
  };

  return response;
}
