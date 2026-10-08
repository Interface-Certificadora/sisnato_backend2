// Carrega o .env antes de qualquer outro módulo ser importado.
// Vários módulos leem process.env na importação (ex.: JwtModule.register em
// auth.module.ts), antes do ConfigModule.forRoot() rodar. Sem isso, essas
// variáveis ficam undefined quando o processo não as recebe do ambiente (Docker).
import { config } from 'dotenv';

config({ quiet: true });
