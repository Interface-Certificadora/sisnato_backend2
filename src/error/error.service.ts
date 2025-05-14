import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ErrorService {
  private readonly logger = new Logger(ErrorService.name, { timestamp: true });
  private readonly Url =
    'https://discord.com/api/webhooks/1371912916588171344/RbIN9OY1fprOYKT-Y1XtEdwXuH1R7ZKlPKF-8LftyC27tDP2Ba-CMrhOmy-E4Kfj-e7j';

  async Post(message: string) {
    try {
      await fetch(this.Url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
      });
    } catch (error) {
      this.logger.error('Erro ao salvar erro:', JSON.stringify(error, null, 2));
    }
  }
}
