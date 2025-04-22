import { Injectable } from '@nestjs/common';
import { Sequelize as SequelizeInstance } from 'sequelize-typescript';
import { Fcweb } from './models/fcweb.model';

@Injectable()
export class Sequelize {
  private sequelizeInstance: SequelizeInstance;

  constructor() {
    this.sequelizeInstance = new SequelizeInstance({
      dialect: 'mysql',
      host: process.env.MYSQL_HOST,
      port: 3306,
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      logging: false, // 👈 isso desativa todos os logs
    });

    // Add your models here
    this.sequelizeInstance.addModels([Fcweb]);

    // Initialize the connection
    this.init();
  }

  async init() {
    try {
      await this.sequelizeInstance.sync();
      console.log('Database connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }

  getInstance(): SequelizeInstance {
    return this.sequelizeInstance;
  }
}
