import { API_CONFIG, getApiUrl, getApiToken, getUserId } from '../config/api';

// Interfaz para los datos del lead (v2.0 - simplificada)
export interface LeadData {
  nombre: string;
  telefono: string;
  email?: string;
  identificacion?: string;
  sexo?: 'M' | 'F';
  direccion?: string;
  notas?: string;
  proviene?: string;
  categoria: string;
  // user_id, fecha_inicio, fecha_vencimiento ya no son necesarios en v2.0
}

// Interfaz para la respuesta de la API
export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  status?: number;
}

// Función para enviar lead a la API de FacturaPro
export const enviarLeadAFacturaPro = async (formData: {
  nombre: string;
  telefono: string;
}): Promise<ApiResponse> => {
  try {
    // Limpiar y validar el teléfono
    const telefonoLimpio = formData.telefono.replace(/[\s\-\(\)]/g, '');
    
    // Validar que el teléfono tenga exactamente 10 dígitos
    if (telefonoLimpio.length !== 10) {
      throw new Error(`El teléfono debe tener exactamente 10 dígitos. Recibido: ${telefonoLimpio.length} dígitos`);
    }

    // Preparar los datos del lead (v2.0 - estructura simplificada)
    const leadData: LeadData = {
      nombre: formData.nombre.trim(),
      telefono: telefonoLimpio,
      proviene: API_CONFIG.LEAD_SOURCE,
      categoria: API_CONFIG.REQUIRED_FIELDS.categoria
      // user_id, fecha_inicio, fecha_vencimiento ya no son necesarios en v2.0
    };

    // Log para debug
    console.log('📤 Datos que se enviarán a la API:', leadData);

    // Obtener la URL de la API
    const apiUrl = getApiUrl();
    const token = getApiToken();
    
    // Log adicional para debug
    console.log('🔗 URL de la API:', apiUrl);
    console.log('🔑 API Token (primeros 50 caracteres):', token.substring(0, 50) + '...');
    console.log('👤 User ID:', getUserId());

    // Verificar que el API Token esté configurado (v2.0 - solo token necesario)
    if (!token || token.includes('YOUR_')) {
      console.warn('⚠️ API Token no configurado. Usando modo de prueba.');
      return {
        success: false,
        message: 'API no configurada. Configura el API Token en src/config/api.ts',
        error: 'API_NOT_CONFIGURED'
      };
    }

    // Verificar si el API Token está configurado
    if (verificarTokenExpirado(token)) {
      console.error('❌ API Token no configurado o inválido.');
      return {
        success: false,
        message: '⚠️ API Token no configurado. Verifica tu configuración en LeadsPro.',
        error: 'TOKEN_NOT_CONFIGURED'
      };
    }

    // Realizar la petición a la API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Con "Bearer" como requiere la API
      },
      body: JSON.stringify(leadData)
    });

    // Verificar si la respuesta es exitosa
    if (response.ok) {
      const responseData = await response.json();
      console.log('✅ Lead creado exitosamente en FacturaPro:', responseData);
      
      return {
        success: true,
        message: 'Lead creado exitosamente',
        data: responseData
      };
    } else {
      // Manejar errores de la API
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Error al crear lead:', response.status, errorData);
      console.error('📋 Headers de respuesta:', Object.fromEntries(response.headers.entries()));
      console.error('🔍 URL que falló:', apiUrl);
      console.error('📤 Datos enviados:', leadData);
      
      let errorMessage = `Error al crear lead: ${response.status}`;
      
      if (response.status === 403) {
        errorMessage = 'Error 403: Token JWT inválido o expirado. Verifica tu autenticación.';
      } else if (response.status === 400) {
        errorMessage = 'Error 400: Datos inválidos. Verifica el formato de los datos enviados.';
      } else if (response.status === 401) {
        errorMessage = 'Error 401: No autorizado. Verifica tu token JWT.';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: errorData.message || 'API_ERROR',
        status: response.status
      };
    }

  } catch (error) {
    console.error('❌ Error de conexión:', error);
    
    return {
      success: false,
      message: 'Error de conexión con la API',
      error: error instanceof Error ? error.message : 'CONNECTION_ERROR'
    };
  }
};

// Función para validar la configuración de la API
export const validarConfiguracionAPI = (): boolean => {
  const token = getApiToken();
  const userId = getUserId();
  
  return !!(token && userId && !token.includes('YOUR_') && !userId.includes('YOUR_'));
};

// Función para verificar si el API Token está expirado
export const verificarTokenExpirado = (token: string): boolean => {
  // Los API Tokens no son JWT, no se pueden decodificar
  // Asumimos que están válidos si están configurados
  console.log('🔑 API Token configurado:', token ? 'Sí' : 'No');
  console.log('📏 Longitud del token:', token ? token.length : 0);
  
  // Para API Tokens, solo verificamos que esté presente
  return !token || token.length === 0;
};

// Función para obtener el estado de la configuración
export const getEstadoConfiguracion = () => {
  const token = getApiToken();
  const userId = getUserId();
  const tokenExpirado = token ? verificarTokenExpirado(token) : true;
  
  return {
    tokenConfigurado: !!(token && !token.includes('YOUR_')),
    userIdConfigurado: !!(userId && !userId.includes('YOUR_')),
    tokenExpirado,
    apiUrl: getApiUrl(),
    completamenteConfigurado: validarConfiguracionAPI() && !tokenExpirado
  };
};
