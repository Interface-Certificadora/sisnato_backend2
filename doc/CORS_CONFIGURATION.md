# Configuração CORS - SISNATO Backend 2

## Visão Geral

Este documento descreve a configuração CORS (Cross-Origin Resource Sharing) implementada no projeto SISNATO Backend 2 para resolver problemas de acesso em produção.

## Problema Identificado

O projeto estava com uma configuração CORS muito permissiva (`origin: '*'`) que pode causar problemas em produção, especialmente quando:
- Há necessidade de enviar credenciais (cookies, tokens)
- Proxy reverso (nginx/apache) está configurado
- Múltiplos domínios precisam acessar a API

## Solução Implementada

### Configuração Dinâmica de Origens

A configuração agora suporta origens específicas via variável de ambiente:

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['*'];
```

### Recursos Implementados

1. **Validação de Origem Dinâmica**
   - Verifica cada requisição contra a lista de origens permitidas
   - Permite requisições sem origin (mobile apps, Postman)
   - Bloqueia origens não autorizadas

2. **Suporte a Credenciais**
   - `credentials: true` permite envio de cookies e headers de autenticação
   - Essencial para autenticação JWT via cookies

3. **Headers Configurados**
   - **Allowed Headers**: Headers que o cliente pode enviar
   - **Exposed Headers**: Headers que o cliente pode ler na resposta

4. **Preflight Caching**
   - `maxAge: 86400` (24 horas) reduz requisições OPTIONS
   - Melhora performance em produção

5. **Métodos HTTP Completos**
   - Suporta GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD

## Configuração de Ambiente

### Desenvolvimento (Local)

Não defina a variável `ALLOWED_ORIGINS` ou use:

```env
# .env
ALLOWED_ORIGINS=*
```

Isso permite todas as origens durante o desenvolvimento.

### Produção

Defina as origens específicas separadas por vírgula:

```env
# .env.production
ALLOWED_ORIGINS=https://sisnato.com.br,https://www.sisnato.com.br,https://app.sisnato.com.br
```

### Exemplos de Configuração

#### Produção com múltiplos domínios
```env
ALLOWED_ORIGINS=https://sisnato.com.br,https://api.sisnato.com.br,https://admin.sisnato.com.br
```

#### Produção + Staging
```env
ALLOWED_ORIGINS=https://sisnato.com.br,https://staging.sisnato.com.br
```

#### Desenvolvimento com frontend local
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000
```

## Configuração de Proxy Reverso

Se você estiver usando nginx ou apache como proxy reverso, certifique-se de que os headers CORS não estejam sendo sobrescritos.

### Nginx

```nginx
location /api {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    
    # NÃO adicione headers CORS aqui, deixe o NestJS gerenciar
    # proxy_set_header Access-Control-Allow-Origin "*"; # ❌ REMOVER
}
```

### Apache

```apache
<VirtualHost *:80>
    ProxyPreserveHost On
    ProxyPass /api http://localhost:3000/api
    ProxyPassReverse /api http://localhost:3000/api
    
    # NÃO adicione headers CORS aqui
    # Header set Access-Control-Allow-Origin "*" # ❌ REMOVER
</VirtualHost>
```

## Troubleshooting

### Erro: "No 'Access-Control-Allow-Origin' header is present"

**Causa**: A origem da requisição não está na lista de permitidas.

**Solução**: Adicione a origem na variável `ALLOWED_ORIGINS`:
```env
ALLOWED_ORIGINS=https://seu-dominio.com.br,https://outro-dominio.com.br
```

### Erro: "CORS policy: Credentials flag is 'true', but the 'Access-Control-Allow-Credentials' header is ''"

**Causa**: Proxy reverso pode estar removendo headers CORS.

**Solução**: 
1. Verifique configuração do nginx/apache
2. Remova qualquer configuração CORS do proxy
3. Deixe apenas o NestJS gerenciar CORS

### Erro: "Not allowed by CORS"

**Causa**: A origem está sendo bloqueada pela validação.

**Solução**:
1. Verifique se a origem está corretamente configurada em `ALLOWED_ORIGINS`
2. Certifique-se de incluir o protocolo (https://) e não incluir barra final
3. Exemplo correto: `https://sisnato.com.br`
4. Exemplo incorreto: `sisnato.com.br` ou `https://sisnato.com.br/`

### Requisições OPTIONS falhando

**Causa**: Preflight requests não estão sendo tratadas corretamente.

**Solução**: A configuração atual já trata OPTIONS com:
- `optionsSuccessStatus: 204`
- `preflightContinue: false`

Se ainda houver problemas, verifique se há middleware bloqueando OPTIONS.

## Testando CORS

### Usando curl

```bash
# Testar requisição simples
curl -H "Origin: https://sisnato.com.br" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Authorization" \
     -X OPTIONS \
     https://apiv2.sisnato.com.br/api

# Verificar headers de resposta
curl -v -H "Origin: https://sisnato.com.br" \
     https://apiv2.sisnato.com.br/api
```

### Usando JavaScript (Browser Console)

```javascript
fetch('https://apiv2.sisnato.com.br/api/endpoint', {
  method: 'GET',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer seu-token'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro CORS:', error));
```

## Segurança

### Boas Práticas

1. **Nunca use `origin: '*'` com `credentials: true`**
   - Isso é bloqueado pelos navegadores por questões de segurança

2. **Sempre especifique origens em produção**
   - Use `ALLOWED_ORIGINS` com domínios específicos
   - Evite wildcards em produção

3. **Minimize headers expostos**
   - Exponha apenas headers necessários
   - Evite expor informações sensíveis

4. **Use HTTPS em produção**
   - Sempre use protocolo seguro
   - Cookies com `credentials: true` requerem HTTPS

### Checklist de Segurança

- [ ] `ALLOWED_ORIGINS` definido com domínios específicos em produção
- [ ] HTTPS configurado e funcionando
- [ ] Proxy reverso não sobrescreve headers CORS
- [ ] Headers sensíveis não estão em `exposedHeaders`
- [ ] Tokens JWT sendo enviados via header Authorization
- [ ] Cookies configurados com `secure: true` e `sameSite` em produção

## Referências

- [MDN - CORS](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS)
- [NestJS - CORS](https://docs.nestjs.com/security/cors)
- [OWASP - CORS](https://owasp.org/www-community/attacks/CORS_OriginHeaderScrutiny)

## Changelog

### 2024-12-29
- ✅ Implementada configuração CORS dinâmica com variável de ambiente
- ✅ Adicionado suporte a credenciais
- ✅ Configurados headers permitidos e expostos
- ✅ Implementado preflight caching (24h)
- ✅ Adicionada validação de origem com callback
- ✅ Documentação completa criada
