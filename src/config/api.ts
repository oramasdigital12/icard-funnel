// Configuración de la API de LeadsPro
export const API_CONFIG = {
  // URLs de la API
  PRODUCTION_URL: 'https://facturapro-api-production.up.railway.app/api/clientes',
  DEVELOPMENT_URL: 'http://localhost:3000/api/clientes',
  
  // Configuración del lead
  LEAD_SOURCE: 'Tu Guía Digital',
  
  // Campos obligatorios para la API
  REQUIRED_FIELDS: {
    categoria: 'lead',
    fecha_inicio: new Date().toISOString().split('T')[0], // Fecha de hoy
    fecha_vencimiento: new Date().toISOString().split('T')[0] // Fecha de hoy
  }
};

// Función para obtener la URL de la API según el entorno
export const getApiUrl = () => {
  // En producción, usar la URL de producción
  // En desarrollo, usar la URL de desarrollo
  return import.meta.env.PROD ? API_CONFIG.PRODUCTION_URL : API_CONFIG.DEVELOPMENT_URL;
};

// import { getSupabaseUserData } from '../utils/supabaseHelper';

// Función para obtener el token JWT desde LeadsPro
export const getApiToken = () => {
  // Token fijo desde LeadsPro (configura aquí tu JWT token)
  return 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjRBZDVjMExuM2kzV0tub2MiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3V6bmRoenFweXdpeHB4bHB4enNsLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI0YjBlNzMzYi1kM2U3LTRjZTgtYmExZi01OGM2NGIwMTM0ODIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU3NDU1MDU4LCJpYXQiOjE3NTc0NTE0NTgsImVtYWlsIjoiZGVtb0BnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoiZGVtb0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiZGVtbyIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNGIwZTczM2ItZDNlNy00Y2U4LWJhMWYtNThjNjRiMDEzNDgyIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTc0NTE0NTh9XSwic2Vzc2lvbl9pZCI6IjA3NjBhYmQ5LWUyZTYtNDUzMS1hMzhhLWU4YjM2YzdhOWY4MSIsImlzX2Fub255bW91cyI6ZmFsc2V9.eEeeyaKsTTYW7UFRaZiaQbtHL6Y8HZticv5XrWD-9sM';
  
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
