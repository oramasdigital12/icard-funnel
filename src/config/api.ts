// Configuración de la API de LeadsPro
export const API_CONFIG = {
  // URLs de la API
  PRODUCTION_URL: 'https://facturapro-api-production.up.railway.app/api/clientes',
  DEVELOPMENT_URL: 'http://localhost:3000/api/clientes',
  
  // Configuración del lead
  LEAD_SOURCE: 'Tu Guía Digital',
  
  // Campos obligatorios para la API (v2.0 - simplificado)
  REQUIRED_FIELDS: {
    categoria: 'lead' // Solo categoria es obligatorio según v2.0
  }
};

// Función para obtener la URL de la API según el entorno
export const getApiUrl = () => {
  // Usar siempre la URL de producción para el funnel
  // El servidor local no está configurado con el API Token
  return API_CONFIG.PRODUCTION_URL;
};

// import { getSupabaseUserData } from '../utils/supabaseHelper';

// Función para obtener el API Token desde LeadsPro
export const getApiToken = () => {
  // API Token fijo desde LeadsPro (v2.0 - 64 caracteres hexadecimales)
  return 'c0fedf4fe1cb3930c985fa52d0802dc72ea8fbcc3b6bd099ce7e8956c906c67c';
  
  // Opción alternativa: Token desde localStorage (si prefieres configuración dinámica)
  // const userData = getSupabaseUserData();
  // if (userData && !userData.isExpired) {
  //   return userData.jwtToken;
  // } 
  
  // Opción alternativa: Token desde variable de entorno
  // return import.meta.env.VITE_LEADSPRO_JWT_TOKEN || 'YOUR_JWT_TOKEN_HERE';
};

// Función para obtener el User ID desde LeadsPro
export const getUserId = () => {
  // User ID fijo desde LeadsPro (configura aquí tu User ID)
  return '4b0e733b-d3e7-4ce8-ba1f-58c64b013482';
  
  // Opción alternativa: User ID desde localStorage (si prefieres configuración dinámica)
  // const userData = getSupabaseUserData();
  // if (userData) {
  //   return userData.userId;
  // }
  
  // Opción alternativa: User ID desde variable de entorno
  // return import.meta.env.VITE_LEADSPRO_USER_ID || 'YOUR_USER_ID_HERE';
};
