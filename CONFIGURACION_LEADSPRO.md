# 🔧 Configuración con LeadsPro

## 📋 Configuración Lista para Tu Guía Digital

### ✅ **Datos de tu cuenta LeadsPro:**

- **User ID:** `4b0e733b-d3e7-4ce8-ba`
- **Email:** `demo@gmail.com`
- **JWT Token:** [Tu token completo desde la interfaz]

### 🔧 **Pasos para configurar:**

#### **1. Obtener tu JWT Token completo**

1. Ve a tu panel de LeadsPro
2. En "Configuración del Funnel"
3. Haz clic en el botón "Copiar" del JWT Token
4. Copia el token completo

#### **2. Configurar el funnel**

Edita el archivo `src/config/api.ts` y reemplaza la línea 30:

```typescript
// Reemplaza esta línea:
return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YjBlNzMzYi1kM2U3LTRjZTgtYmEiLCJlbWFpbCI6ImRlbW9AZ21haWwuY29tIiwiaWF0IjoxNzM0NzQ4MDAwLCJleHAiOjE3MzQ4MzQ0MDB9.YOUR_ACTUAL_JWT_TOKEN_HERE";

// Con tu token real:
return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0YjBlNzMzYi1kM2U3LTRjZTgtYmEiLCJlbWFpbCI6ImRlbW9AZ21haWwuY29tIiwiaWF0IjoxNzM0NzQ4MDAwLCJleHAiOjE3MzQ4MzQ0MDB9.TU_TOKEN_REAL_AQUI";
```

#### **3. Verificar configuración**

El User ID ya está configurado correctamente:

```typescript
return "4b0e733b-d3e7-4ce8-ba"; // ✅ Ya configurado
```

### 🧪 **Probar la integración**

1. **Ejecuta el proyecto:**

   ```bash
   npm run dev
   ```

2. **Completa el formulario** con datos de prueba:

   - Nombre: "Juan Pérez"
   - Teléfono: "(787) 123-4567"

3. **Abre la consola** del navegador (F12)

4. **Verifica que aparezca:**
   - ✅ `API configurada correctamente`
   - 📤 `Enviando lead a FacturaPro...`
   - ✅ `Lead registrado exitosamente en FacturaPro`

### 📊 **Flujo completo:**

1. **Usuario completa el formulario** → Validación
2. **Se envía el lead a LeadsPro** → API call
3. **Se redirige a WhatsApp** → Mensaje personalizado

### 🔍 **Verificar en LeadsPro:**

Después de enviar un lead de prueba:

1. Ve a tu panel de LeadsPro
2. Busca en la sección "Leads"
3. Deberías ver el nuevo lead con:
   - 🎯 Etiqueta "Lead"
   - ✅ Botón "Completar"
   - 📞 Botones de contacto

### ⚠️ **Importante:**

- **El JWT Token expira** - si deja de funcionar, genera uno nuevo
- **Solo necesitas cambiar** el JWT Token en `api.ts`
- **El User ID ya está correcto** - no lo cambies

### 🛠️ **Solución de problemas:**

#### **Error: "API no configurada"**

- Verifica que hayas reemplazado el JWT Token
- Confirma que no hay espacios extra

#### **Error: "401 Unauthorized"**

- El JWT Token expiró o es incorrecto
- Genera un nuevo token en LeadsPro

#### **Error: "400 Bad Request"**

- Verifica que el User ID sea correcto
- Confirma que la categoría sea "lead"

### 📞 **Datos de la API:**

- **Endpoint:** `https://facturapro-api-production.up.railway.app/api/clientes`
- **Método:** `POST`
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer [TU_JWT_TOKEN]`

### 🎯 **Estructura de datos enviada:**

```json
{
  "nombre": "Juan Pérez",
  "telefono": "7871234567",
  "proviene": "Tu Guía Digital",
  "categoria": "lead",
  "fecha_inicio": "9999-12-31",
  "fecha_vencimiento": "9999-12-31",
  "user_id": "4b0e733b-d3e7-4ce8-ba"
}
```

¡Listo! Tu funnel está configurado para enviar leads directamente a LeadsPro.
