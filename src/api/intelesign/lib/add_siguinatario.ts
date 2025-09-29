interface SignatarioType {
  nome: string;
  email: string;
  cpf: string;
  asstype: 'simple' | 'qualified';
  type: 'signer' | 'approver' | 'carbon-copy';
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Valida os dados de um signatário
 */
function validateSignatario(signatario: SignatarioType, index: number): void {
  const requiredFields = ['email', 'nome', 'cpf', 'asstype', 'type'];
  const missingFields = requiredFields.filter(field => !signatario[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Signatário ${index + 1}: campos obrigatórios ausentes: ${missingFields.join(', ')}`
    );
  }

  // Validação básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(signatario.email)) {
    throw new Error(`Signatário ${index + 1}: email inválido`);
  }

  // Validação básica de CPF (apenas dígitos)
  const cpfRegex = /^\d{11}$/;
  if (!cpfRegex.test(signatario.cpf.replace(/\D/g, ''))) {
    throw new Error(`Signatário ${index + 1}: CPF deve conter 11 dígitos`);
  }
}

/**
 * Extrai o tipo de erro para categorização
 */
function extractErrorType(errorMessage: string): string {
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
    return 'Autenticação';
  }
  if (errorMessage.includes('422') || errorMessage.includes('validation')) {
    return 'Validação';
  }
  if (errorMessage.includes('500') || errorMessage.includes('internal server')) {
    return 'Erro do Servidor';
  }
  if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
    return 'Rede/Timeout';
  }
  if (errorMessage.includes('email inválido')) {
    return 'Email Inválido';
  }
  if (errorMessage.includes('CPF')) {
    return 'CPF Inválido';
  }
  if (errorMessage.includes('campos obrigatórios')) {
    return 'Campos Obrigatórios';
  }
  return 'Outros';
}

/**
 * Cria o payload para a API do IntelliSign
 */
function createSignatarioPayload(signatario: SignatarioType, index: number) {
  return {
    type: signatario.type,
    signature_type: signatario.asstype,
    routing_order: index + 1,
    addressees: [
      {
        via: 'email',
        value: signatario.email,
        name: signatario.nome,
        identifiers: [
          {
            code: 'CPF',
            is_required: true,
            // value: signatario.cpf.replace(/\D/g, ''), // Remove caracteres não numéricos
            value: '34057309888', // Remove caracteres não numéricos
          },
        ],
      },
    ],
  };
}

/**
 * Adiciona um único signatário
 */
async function addSingleSignatario(
  signatario: SignatarioType,
  index: number,
  envelopeId: string,
  token: string
): Promise<ApiResponse> {
  const url = `https://api.intellisign.com/v1/envelopes/${envelopeId}/recipients`;

  try {
    validateSignatario(signatario, index);

    const payload = createSignatarioPayload(signatario, index);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    // Tratamento detalhado da resposta da API
    const data = await response.json();

    if (!response.ok) {
      // Extrai informações detalhadas do erro da API
      let errorMessage = `Erro ${response.status} ao adicionar signatário ${signatario.nome} => ${JSON.stringify(data, null, 2)}`;

      if (data.message) {
        errorMessage += `: ${data.message}`;
      }

      if (data.errors) {
        // Se houver erros específicos de campos
        const fieldErrors = Object.entries(data.errors)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
          .join('; ');
        errorMessage += ` | Detalhes: ${fieldErrors}`;
      }

      if (data.error) {
        errorMessage += ` | ${data.error}`;
      }

      // Log detalhado para debug
      console.error(`❌ API Error Details:`, {
        status: response.status,
        statusText: response.statusText,
        signatario: signatario.nome,
        responseData: data
      });

      return {
        success: false,
        error: errorMessage,
      };
    }

    console.log(`✅ Signatário ${signatario.nome} adicionado com sucesso`);
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: `Erro ao processar signatário ${signatario.nome}: ${error.message}`,
    };
  }
}

/**
 * Adiciona múltiplos signatários de forma otimizada
 */
export async function addSignatarios(
  signatarios: SignatarioType[],
  envelopeId: string,
  token: string,
): Promise<ApiResponse[]> {
  try {
    // Validação inicial
    if (!signatarios || signatarios.length === 0) {
      throw new Error('Lista de signatários não pode estar vazia');
    }

    if (!envelopeId || !token) {
      throw new Error('EnvelopeId e token são obrigatórios');
    }

    console.log(`🚀 Adicionando ${signatarios.length} signatário(s) ao envelope ${envelopeId}`);

    // Processa todos os signatários em paralelo para melhor performance
    const promises = signatarios.map((signatario, index) =>
      addSingleSignatario(signatario, index, envelopeId, token)
    );

    const results = await Promise.allSettled(promises);

    // Processa os resultados
    const responses: ApiResponse[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: `Falha ao processar signatário ${index + 1}: ${result.reason}`,
        };
      }
    });

    // Log dos resultados
    const successful = responses.filter(r => r.success).length;
    const failed = responses.filter(r => !r.success).length;

    console.log(`✅ Signatários processados: ${successful} sucessos, ${failed} falhas`);

    // Se houver falhas, log detalhado dos erros
    if (failed > 0) {
      const failedResponses = responses.filter(r => !r.success);
      console.error('❌ Erros encontrados ao adicionar signatários:');

      failedResponses.forEach((response, index) => {
        console.error(`  ${index + 1}. ${response.error}`);
      });

      // Cria um resumo dos tipos de erro mais comuns
      const errorSummary = failedResponses.reduce((acc, response) => {
        const errorType = extractErrorType(response.error);
        acc[errorType] = (acc[errorType] || 0) + 1;
        return acc;
      }, {});

      console.error('📊 Resumo dos tipos de erro:', errorSummary);
    }

    return responses;
  } catch (error) {
    console.error('❌ Erro crítico ao adicionar signatários:', error);
    throw new Error(`Erro ao adicionar signatários: ${error.message}`);
  }
}
