import { Injectable } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';

type MetadataProps = {
  url?: string;
  fileName: string;
  extension: string;
};
@Injectable()
export class SmsService {
  constructor(private S3: S3Service) {}

  async sendSms(sms: string, telefone: string) {
    try {
      const response = await fetch(
        `https://api.inovstar.com/core/v2/api/chats/create-new`,

        {
          headers: {
            'access-token': '60de0c8bb0012f1e6ac5546b',
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            number: '55' + telefone,
            message: sms,
            sectorId: '60de0c8bb0012f1e6ac55473',
          }),
        },
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async sendMediaSms(
    telefone: string,
    caption: string,
    metadata: MetadataProps,
  ) {
    try {
      const Bucket = 'interface-whasapp';
      const imgUrl = metadata.url
        ? metadata.url
        : await this.S3.getFileUrl(Bucket, metadata.fileName);
      const data = {
        number: '55' + telefone,
        contactId: 'string',
        forceSend: true,
        verifyContact: true,
        linkUrl: imgUrl,
        extension: metadata.extension,
        fileName: metadata.fileName,
        caption: caption,
        delayInSeconds: 0,
        isWhisper: true,
        sectorId: '60de0c8bb0012f1e6ac55473',
      };

      const response = await fetch(
        `https://api.inovstar.com/core/v2/ap/chats/send-media`,
        {
          method: 'POST',
          headers: {
            'access-token': process.env.WHATSAPP_TOKEN || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();
      console.log('🚀 ~ SmsService ~ result:', result);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
