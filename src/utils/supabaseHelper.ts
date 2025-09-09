// Utilidades para trabajar con Supabase Auth
// Este archivo te ayuda a obtener JWT y User ID desde Supabase

export interface SupabaseUserData {
  userId: string;
  jwtToken: string;
  email?: string;
  isExpired: boolean;
}

// Función para decodificar JWT (solo para obtener información, no para validar)
export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando JWT:', error);
    return null;
  }
};

// Función para verificar si un token está expirado
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

// Función para obtener datos del usuario desde localStorage
export const getSupabaseUserData = (): SupabaseUserData | null => {
  if (typeof window === 'undefined') return null;

  // Buscar en diferentes ubicaciones donde Supabase guarda los datos
  const possibleTokenKeys = [
    'supabase.auth.token',
    'sb-access-token',
    'supabase.auth.session'
  ];

  const possibleUserIdKeys = [
    'supabase.user.id',
    'sb-user-id',
    'supabase.user.data'
  ];

  let token = '';
  let userId = '';

  // Buscar token
  for (const key of possibleTokenKeys) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (value) {
      // Si es un objeto JSON, extraer el access_token
      try {
        const parsed = JSON.parse(value);
        token = parsed.access_token || parsed.token || value;
      } catch {
        token = value;
      }
      break;
    }
  }

  // Buscar user ID
  for (const key of possibleUserIdKeys) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (value) {
      // Si es un objeto JSON, extraer el id
      try {
        const parsed = JSON.parse(value);
        userId = parsed.id || parsed.user?.id || value;
      } catch {
        userId = value;
      }
      break;
    }
  }

  // Si no encontramos en las claves específicas, buscar en todas las claves
  if (!token || !userId) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('supabase')) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.access_token && !token) {
              token = parsed.access_token;
            }
            if (parsed.user?.id && !userId) {
              userId = parsed.user.id;
            }
            if (parsed.id && !userId) {
              userId = parsed.id;
            }
          } catch {
            // No es JSON, continuar
          }
        }
      }
    }
  }

  if (!token || !userId) {
    return null;
  }

  const payload = decodeJWT(token);
  const isExpired = isTokenExpired(token);

  return {
    userId,
    jwtToken: token,
    email: payload?.email,
    isExpired
  };
};

// Función para mostrar información de debug
export const debugSupabaseAuth = () => {
  console.log('🔍 Debugging Supabase Auth...');
  
  const userData = getSupabaseUserData();
  
  if (userData) {
    console.log('✅ Datos encontrados:');
    console.log('  User ID:', userData.userId);
    console.log('  Email:', userData.email);
    console.log('  Token expirado:', userData.isExpired);
    console.log('  Token (primeros 50 chars):', userData.jwtToken.substring(0, 50) + '...');
    
    const payload = decodeJWT(userData.jwtToken);
    if (payload) {
      console.log('  Payload del JWT:', payload);
    }
  } else {
    console.log('❌ No se encontraron datos de Supabase Auth');
    console.log('📋 Claves disponibles en localStorage:');
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('sb-'))) {
        console.log('  -', key);
      }
    }
  }
  
  return userData;
};

// Función para configurar manualmente los datos
export const setSupabaseUserData = (userId: string, jwtToken: string) => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('supabase.user.id', userId);
  localStorage.setItem('supabase.auth.token', jwtToken);
  
  console.log('✅ Datos de Supabase configurados manualmente');
  console.log('  User ID:', userId);
  console.log('  Token configurado');
};

// Función para limpiar datos de Supabase
export const clearSupabaseUserData = () => {
  if (typeof window === 'undefined') return;
  
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('sb-'))) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log('🧹 Datos de Supabase limpiados');
};
