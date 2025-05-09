# Logs Module

Este módulo fornece serviços para registrar e recuperar logs com base em um `EffectId` e `rota`.

## Serviços Disponíveis
### `Get`
Recupera os **20 logs mais recentes** para um determinado `id` e `rota`.

#### Parâmetros
```ts
{
  id: number;   // ID do efeito a ser buscado
  rota: string; // Nome da rota associada ao log
}
```

#### Retorno
Um array de strings contendo as descrições dos logs:
```ts
["Log 1", "Log 2", "Log 3", ...]
```

#### Exemplo de Uso
```ts
constructor( private Log: logService ){}
const logs = await Log.Get({ id: 1, rota: "api/user" });
console.log(logs);
// Saída: ["Usuário criado", "Usuário atualizado", ...]
```

---

### `Post`
Cria um novo log e retorna os **20 logs mais recentes** para aquele `EffectId` e `rota`.

#### Parâmetros
```ts
{
  User: number;      // ID do usuário que está criando o log
  EffectId: number;  // ID do efeito sendo logado
  rota: string;      // Nome da rota associada ao log
  descricao: string; // Descrição do log
}
```

#### Retorno
Um array de strings contendo as descrições dos logs mais recentes:
```ts
["Novo log", "Log anterior", "Outro log", ...]
```

#### Exemplo de Uso
```ts
constructor( private Log: logService ){}
const logs = await Log.Post({
  User: 1,
  EffectId: 1,
  rota: "api/user",
  descricao: "Usuário deletado"
});
console.log(logs);
// Saída: ["Usuário deletado", "Usuário atualizado", ...]
```

## Tratamento de Erros
Se ocorrer um erro durante a execução dos serviços, um `HttpException` será lançado com código **400** e um objeto contendo a mensagem de erro:

#### Exemplo de erro
```json
{
  "message": "Erro ao acessar o banco de dados"
}
```

