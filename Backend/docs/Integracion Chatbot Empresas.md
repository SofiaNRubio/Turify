# Integración del Chatbot con el Endpoint de Empresas

**Fecha de implementación:** 2 de julio de 2025

## Resumen de Cambios

Se ha mejorado el chatbot TurifyBot para integrar automáticamente la información de empresas turísticas del endpoint `/api/empresas` como parte de su contexto de conversación. Además, se ha integrado información de atractivos turísticos relacionados.

## Funcionalidades Implementadas

### 1. Contexto Automático de Empresas

-   **Descripción**: Al iniciar una nueva sesión de chat, el bot obtiene automáticamente toda la información de empresas registradas y la incluye en su contexto base.
-   **Beneficio**: El bot puede responder con información actualizada sobre hoteles, restaurantes, actividades y servicios turísticos.

### 2. Detección Inteligente de Consultas

-   **Descripción**: El sistema detecta automáticamente cuando un usuario hace preguntas relacionadas con empresas, servicios turísticos o ubicaciones.
-   **Palabras clave detectadas**: empresa, hotel, restaurante, alojamiento, hospedaje, comer, actividad, servicio, comercio, bodega, turismo, donde, dónde, recomendar, recomendación.
-   **Acción**: Cuando se detectan estas palabras, se actualiza el contexto con información fresca de empresas.

### 3. Filtrado Inteligente por Distrito

-   **Descripción**: Si el usuario menciona un distrito específico, el bot filtra automáticamente las empresas de esa zona.
-   **Distritos reconocidos**: Centro, General Belgrano, Goudge, Villa Atuel, Cañada Seca, Real del Padre, Cuadro Benegas.

### 4. Endpoints Adicionales

#### `/api/chat/empresas-context` (GET)

-   **Propósito**: Obtener el contexto completo de empresas en formato estructurado.
-   **Respuesta**: Lista de empresas con información detallada y contexto formateado para el chatbot.

#### `/api/chat/clear-session` (DELETE)

-   **Propósito**: Limpiar una sesión específica de chat para reiniciarla con contexto actualizado.
-   **Uso**: Útil cuando se agregan nuevas empresas y se quiere que el bot las incluya inmediatamente.

#### `/api/chat/stats` (GET)

-   **Propósito**: Obtener estadísticas sobre las sesiones activas del chatbot.

## Estructura de Datos de Empresas

El chatbot tiene acceso a la siguiente información de cada empresa:

```json
{
    "id": "emp-uuid",
    "nombre": "Nombre de la empresa",
    "descripcion": "Descripción detallada",
    "email": "contacto@empresa.com",
    "telefono": "+54 260 123456",
    "sitio_web": "https://www.empresa.com",
    "direccion": "Dirección completa",
    "distrito": "Nombre del distrito",
    "categoria": "Categoría de la empresa",
    "latitud": -34.123456,
    "longitud": -68.123456
}
```

## Mejoras en el Prompt Base

El prompt base del chatbot se ha actualizado para:

-   Instruir al bot sobre cómo usar la información de empresas
-   Enfatizar que debe incluir información de contacto cuando esté disponible
-   Mantener la restricción de no inventar información

## Ejemplo de Uso

**Usuario**: "¿Dónde puedo comer en el centro de San Rafael?"

**Proceso del bot**:

1. Detecta las palabras clave "comer" y "centro"
2. Filtra empresas del distrito "Centro" que sean de categoría relacionada con gastronomía
3. Proporciona una respuesta con información detallada incluyendo nombres, direcciones, teléfonos y descripciones

**Respuesta esperada**: Una lista estructurada de restaurantes en el centro con toda la información disponible.

## Consideraciones Técnicas

### Rendimiento

-   Las consultas a la base de datos se optimizan usando LEFT JOIN con la tabla de categorías
-   Se implementa filtrado por distrito para reducir la cantidad de datos procesados
-   El contexto se genera solo cuando es necesario

### Memoria

-   Las sesiones de chat se mantienen en memoria (Map)
-   Se proporciona endpoint para limpiar sesiones si es necesario
-   Se incluyen estadísticas para monitorear el uso

### Escalabilidad

-   El sistema está preparado para manejar múltiples sesiones concurrentes
-   La información se actualiza dinámicamente en cada consulta relevante
-   Se pueden agregar fácilmente nuevos filtros y categorías

## Beneficios para los Usuarios

1. **Información Actualizada**: El bot siempre tiene acceso a las empresas más recientes registradas en el sistema.
2. **Respuestas Específicas**: Puede filtrar por ubicación y tipo de servicio automáticamente.
3. **Información Completa**: Incluye datos de contacto, ubicación y descripciones detalladas.
4. **Experiencia Fluida**: No requiere comandos especiales, detecta automáticamente las necesidades del usuario.

## Integración de Atractivos Turísticos

**Actualización:** 2 de julio de 2025

### Nuevas Funcionalidades Agregadas

#### 1. Información de Atractivos con Empresas Asociadas

-   **Descripción**: El chatbot ahora también tiene acceso a toda la información de atractivos turísticos registrados en el sistema.
-   **Relación Empresa-Atractivo**: Cada atractivo muestra qué empresa lo gestiona cuando corresponde.
-   **Información disponible**:
    -   Nombre y descripción del atractivo
    -   Ubicación (dirección, distrito, coordenadas)
    -   Información de contacto (teléfono, email, sitio web)
    -   Horarios de funcionamiento
    -   Precios
    -   Empresa gestora (cuando aplique)
    -   Categoría del atractivo

#### 2. Palabras Clave Expandidas

Se agregaron nuevas palabras clave para detectar consultas sobre atractivos:

-   **Nuevas palabras**: atractivo, lugar, visitar, hacer, ver, actividades, turístico, paseo, excursión
-   **Efecto**: Mayor precisión en la detección de consultas relacionadas con turismo

#### 3. Contexto Completo Integrado

-   **Funcionalidad**: Cuando se detecta una consulta relevante, el bot obtiene información tanto de empresas como de atractivos
-   **Filtrado inteligente**: Si se menciona un distrito, filtra tanto empresas como atractivos de esa zona
-   **Relaciones**: Muestra claramente qué empresa gestiona cada atractivo

### Nuevos Endpoints API

#### `/api/chat/atractivos-context` (GET)

-   **Propósito**: Obtener solo información de atractivos con sus empresas asociadas
-   **Respuesta**: Lista completa de atractivos con información detallada

#### `/api/chat/contexto-completo` (GET)

-   **Propósito**: Obtener información completa de empresas y atractivos
-   **Parámetros**:
    -   `distrito` (opcional): Filtrar por distrito específico
-   **Respuesta**: Contexto completo formateado para el chatbot

#### `/api/chat/empresas-context` (GET) - Actualizado

-   **Cambio**: Ahora incluye también información de atractivos
-   **Respuesta ampliada**: Empresas, atractivos y contexto completo

### Estructura de Datos de Atractivos

```json
{
    "id": "atr-uuid",
    "nombre": "Nombre del atractivo",
    "descripcion": "Descripción detallada",
    "direccion": "Dirección completa",
    "distrito": "Nombre del distrito",
    "latitud": -34.123456,
    "longitud": -68.123456,
    "precio": "Información de precios",
    "horarios": "Horarios de funcionamiento",
    "telefono": "+54 260 123456",
    "email": "contacto@atractivo.com",
    "sitio_web": "https://www.atractivo.com",
    "categoria": "Categoría del atractivo",
    "empresa_id": "emp-uuid",
    "empresa_nombre": "Empresa Gestora S.A.",
    "img_url": "https://imagen.jpg"
}
```

### Ejemplos de Uso Mejorado

**Usuario**: "¿Qué atractivos puedo visitar en Villa Atuel?"

**Proceso del bot**:

1. Detecta las palabras clave "atractivos", "visitar" y "Villa Atuel"
2. Filtra atractivos del distrito "Villa Atuel"
3. Incluye información de las empresas que gestionan esos atractivos
4. Proporciona respuesta completa con contactos y detalles

**Usuario**: "¿Hay actividades que ofrezca la empresa XYZ?"

**Proceso del bot**:

1. Detecta "actividades" y "empresa"
2. Busca atractivos asociados a empresas específicas
3. Muestra tanto la información de la empresa como de sus atractivos

### Beneficios Adicionales

1. **Vista Integral**: Los usuarios obtienen una perspectiva completa del turismo local
2. **Conexiones Claras**: Se muestra claramente la relación entre empresas y atractivos
3. **Información Práctica**: Incluye horarios, precios y datos de contacto específicos
4. **Filtrado Inteligente**: Respuestas más precisas según ubicación o empresa
5. **Contexto Enriquecido**: El bot puede hacer recomendaciones más informadas

### Mejoras en el Prompt

-   Instrucciones específicas sobre cómo manejar la relación empresa-atractivo
-   Énfasis en mencionar la empresa gestora cuando sea relevante
-   Directrices para incluir información práctica (horarios, precios)
