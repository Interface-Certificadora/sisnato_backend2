// Arquivo: teste-carga-login.js

import http from 'k6/http';
import { sleep, check } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import { SharedArray } from 'k6/data';

// 1. --- CONFIGURAÇÕES INICIAIS ---
// Altere para a URL base da sua API
const BASE_URL = 'https://apiv2.sisnato.com.br';
// const BASE_URL = 'http://localhost:7877';

// Crie uma lista com as credenciais dos seus 15 usuários de teste
// IMPORTANTE: Nunca use credenciais de produção reais aqui!
const USER_CREDENTIALS = new SharedArray('users', function () {
  return [
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
    { user: 'user', pass: '1234' },
  ];
});

// 2. --- OPÇÕES DO TESTE ---
export const options = {
  vus: 15,
  duration: '30s',
  thresholds: {
    // Exigimos que 95% das requisições terminem em menos de 800ms
    http_req_duration: ['p(95)<800'],
    // Exigimos que a taxa de erro seja menor que 1%
    http_req_failed: ['rate<0.01'],
  },
};

// 3. --- FUNÇÃO SETUP: Executada uma vez antes do teste começar ---
// O objetivo é fazer o login de cada usuário e armazenar os tokens.
export function setup() {
  console.log('Iniciando o setup: fazendo login dos usuários...');
  const tokens = [];
  const Users = [];

  for (const cred of USER_CREDENTIALS) {
    console.log(`Tentando login para usuário: ${cred.user}`);
    
    // Altere '/auth/login' para o seu endpoint de login real
    const loginRes = http.post(
      `${BASE_URL}/auth`,
      JSON.stringify({
        username: cred.user,
        password: cred.pass,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );

    // Log detalhado da resposta
    // console.log(`Status do login para ${cred.user}: ${loginRes.status}`);
    // console.log(`Body da resposta: ${loginRes.body}`);

    // Verificamos se o login foi bem-sucedido
    const loginSuccess = check(loginRes, {
      'login bem-sucedido': (r) => r.status === 201
    });

    if (!loginSuccess) {
      console.error(`❌ Login falhou para ${cred.user}. Status: ${loginRes.status}`);
    }

    // Extraia o token da resposta JSON.
    // Altere 'token' se o nome do campo na sua API for diferente (ex: 'access_token')
    try {
      const authToken = loginRes.json();
      if (authToken && authToken.token) {
        tokens.push(authToken.token);
        Users.push(authToken.user);
        console.log(`✅ Token obtido com sucesso para ${cred.user}`);
      } else {
        console.error(`❌ Token não encontrado na resposta para ${cred.user}`);
        console.error(`Estrutura da resposta: ${JSON.stringify(authToken)}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar JSON para ${cred.user}: ${error}`);
    }
  }

  console.log(`Setup concluído. ${tokens.length} tokens foram gerados.`);
  // O array de tokens é retornado e ficará disponível na função 'default'
  return { tokens, Users };
}

// 4. --- FUNÇÃO PRINCIPAL (DEFAULT): O código que cada VU executa em loop ---
export default function (data) {
  // Cada usuário virtual (VU) tem um ID único (__VU). Usamos isso para pegar um token.
  // Como __VU começa em 1 e arrays em 0, usamos __VU - 1.
  const userIndex = __VU - 1; // Pega o índice do VU atual (de 0 a 4)
  const userToken = data.tokens[userIndex];
  const currentUser = data.Users[userIndex]; // Pega o objeto do usuário atual

  // Se por algum motivo o token não existir para este VU, paramos sua execução.
  if (!userToken || !currentUser) {
    console.error(`Token não encontrado para o VU: ${__VU}`);
    return;
  }

  // A sua lógica está correta: pegamos o 'id' diretamente do objeto 'currentUser'
  const userId = currentUser.id;

  // Prepara os headers de autenticação que serão usados nas próximas requisições
  const params = {
    headers: {
      'Authorization': `Bearer ${userToken}`,
      'Content-Type': 'application/json',
    },
  };

  // Agora, fazemos as chamadas para os endpoints protegidos usando o token
  const res0 = http.get(`${BASE_URL}/user/get/${userId}`, params);
  console.log("🚀 ~ res0:", res0.status)
  check(res0, { 'GET /user/get/{id} status 200': (r) => r.status === 200 });
  sleep(1);

  const res1 = http.get(`${BASE_URL}/solicitacao`, params);
  check(res1, { 'GET /solicitacao status 200': (r) => r.status === 200 });
  sleep(1);

  const res2 = http.get(`${BASE_URL}/dashboard`, params);
  check(res2, { 'GET /dashboard status 200': (r) => r.status === 200 });
  sleep(1);

  const res3 = http.get(`${BASE_URL}/empreendimento`, params);
  check(res3, { 'GET /empreendimento status 200': (r) => r.status === 200 });
  sleep(1);

  const res4 = http.get(`${BASE_URL}/construtora`, params);
  check(res4, { 'GET /construtora status 200': (r) => r.status === 200 });
  sleep(1);

  const res5 = http.get(`${BASE_URL}/financeiro`, params);
  check(res5, { 'GET /financeiro status 200': (r) => r.status === 200 });
  sleep(1);
}

// 5. --- FUNÇÃO TEARDOWN (opcional): Executada uma vez no final do teste ---
export function handleSummary(data) {
  console.log('Teste finalizado!');
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}