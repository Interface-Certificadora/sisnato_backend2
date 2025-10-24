import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Sequelize as SequelizeInstance } from 'sequelize-typescript';
import { Fcweb } from './models/fcweb.model';

@Injectable()
export class Sequelize implements OnModuleInit, OnModuleDestroy {
  private sequelizeInstance: SequelizeInstance;
  private isConnected = false;
  private retryAttempts = 0;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 5000; // 5 segundos

  constructor() {
    this.initializeSequelize();
  }

  private initializeSequelize() {
    try {
      this.sequelizeInstance = new SequelizeInstance({
        dialect: 'mysql',
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || '3306', 10),
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        logging: false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000, // Tempo máximo de espera para adquirir uma conexão (ms)
          idle: 10000, // Tempo máximo que uma conexão pode ficar inativa
          evict: 1000, // Intervalo de verificação de conexões ociosas (ms)
        },
        retry: {
          max: 3, // Número máximo de tentativas de reconexão
          timeout: 30000, // Tempo máximo de espera por uma conexão (ms)
        },
        dialectOptions: {
          connectTimeout: 10000, // Timeout de conexão de 10 segundos
        },
      });

      // Adiciona manipuladores de eventos para melhor depuração
      this.sequelizeInstance
        .authenticate()
        .then(() => {
          this.isConnected = true;
          this.retryAttempts = 0;
          console.log(
            '✅ Conexão com o banco de dados estabelecida com sucesso',
          );
        })
        .catch((error) => {
          console.error(
            '❌ Falha na conexão com o banco de dados:',
            error.message,
          );
          this.handleConnectionError(error);
        });

      // Adiciona os modelos
      this.sequelizeInstance.addModels([Fcweb]);
    } catch (error) {
      console.error('❌ Erro ao inicializar o Sequelize:', error);
      this.isConnected = false;
    }
  }

  async onModuleInit() {
    await this.initializeConnection();
  }

  async onModuleDestroy() {
    await this.closeConnection();
  }

  private async initializeConnection() {
    try {
      await this.sequelizeInstance.authenticate();
      this.isConnected = true;
      this.retryAttempts = 0;
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso');
    } catch (error) {
      console.error('❌ Falha na conexão com o banco de dados:', error.message);
      this.handleConnectionError(error);
    }
  }

  private async closeConnection() {
    if (this.sequelizeInstance) {
      try {
        await this.sequelizeInstance.close();
        this.isConnected = false;
        console.log('🔌 Conexão com o banco de dados encerrada');
      } catch (error) {
        console.error(
          '❌ Erro ao encerrar a conexão com o banco de dados:',
          error,
        );
      }
    }
  }

  private async handleConnectionError(error: any) {
    this.isConnected = false;
    this.retryAttempts++;

    if (this.retryAttempts <= this.MAX_RETRY_ATTEMPTS) {
      console.log(
        `🔄 Tentativa de reconexão ${this.retryAttempts}/${this.MAX_RETRY_ATTEMPTS} em ${this.RETRY_DELAY_MS / 1000} segundos...`,
      );

      // Tenta reconectar após o delay
      setTimeout(() => {
        this.initializeConnection();
      }, this.RETRY_DELAY_MS);
    } else {
      console.error(
        `❌ Número máximo de tentativas de reconexão (${this.MAX_RETRY_ATTEMPTS}) atingido. Por favor, verifique sua conexão com o banco de dados.`,
      );
      // Aqui você pode adicionar notificações adicionais (ex: enviar email, notificar Slack, etc.)
    }
  }

  getInstance(): SequelizeInstance | null {
    if (!this.isConnected) {
      console.warn(
        '⚠️ Aviso: Tentando acessar o banco de dados sem uma conexão ativa',
      );
      return null;
    }
    return this.sequelizeInstance;
  }

  isDatabaseConnected(): boolean {
    return this.isConnected;
  }
}
