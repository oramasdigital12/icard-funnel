import { API_CONFIG, getApiUrl, getApiToken, getUserId } from '../config/api';

// Interfaz para los datos del lead
export interface LeadData {
  nombre: string;
  telefono: string;
  email?: string;
  identification_number?: string;
  sexo?: 'M' | 'F';
  direccion?: string;
  notas?: string;
  proviene?: string;
  categoria: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  user_id: string;
}

// Interfaz para la respuesta de la API
export interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

// Función para enviar lead a la API de FacturaPro
export const enviarLeadAFacturaPro = async (formData: {
  nombre: string;
  telefono: string;
}): Promise<ApiResponse> => {
  try {
    // Preparar los datos del lead
    const leadData: LeadData = {
      nombre: formData.nombre.trim(),
      telefono: formData.telefono.replace(/[\s\-\(\)]/g, ''), // Limpiar formato
      proviene: API_CONFIG.LEAD_SOURCE,
      categoria: API_CONFIG.REQUIRED_FIELDS.categoria,
      fecha_inicio: API_CONFIG.REQUIRED_FIELDS.fecha_inicio,
      fecha_vencimiento: API_CONFIG.REQUIRED_FIELDS.fecha_vencimiento,
      user_id: getUserId()
    };

    // Obtener la URL de la API
    const apiUrl = getApiUrl();
    const token = getApiToken();

    // Verificar que el token y user_id estén configurados
    if (token === 'YOUR_JWT_TOKEN_HERE' || getUserId() === 'YOUR_USER_ID_HERE') {
      console.warn('⚠️ API Token o User ID no configurados. Usando modo de prueba.');
      return {
        success: false,
        message: 'API no configurada. Configura el token JWT y User ID en src/config/api.ts',
        error: 'API_NOT_CONFIGURED'
      };
    }

    // Realizar la petición a la API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
      
      return {
        success: false,
        message: `Error al crear lead: ${response.status}`,
        error: errorData.message || 'API_ERROR'
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
  
  return token !== 'YOUR_JWT_TOKEN_HERE' && userId !== 'YOUR_USER_ID_HERE';
};

// Función para obtener el estado de la configuración
export const getEstadoConfiguracion = () => {
  const token = getApiToken();
  const userId = getUserId();
  
  return {
    tokenConfigurado: token !== 'YOUR_JWT_TOKEN_HERE',
    userIdConfigurado: userId !== 'YOUR_USER_ID_HERE',
    apiUrl: getApiUrl(),
    completamenteConfigurado: validarConfiguracionAPI()
  };
};
