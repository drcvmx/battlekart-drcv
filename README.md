# Go-Kart Zen Loyalty System (Demo)

Este repositorio contiene la versión de **demostración front-end** de un sistema de lealtad completo diseñado para centros de entretenimiento y pistas de Go-Karts. 

El modelo real en producción con base de datos, autenticación segura e integración a WhatsApp puede verse en funcionamiento en: **[https://battlekartvip.com/](https://battlekartvip.com/)**

## 🏁 Características Principales

Este sistema está diseñado para incentivar el regreso de los clientes a través de mecánicas de gamificación, membresías VIP y recompensas canjeables.

### 👤 Para Usuarios / Clientes
- **Niveles de Lealtad:** Progresión de niveles (Bronce, Plata, Oro, Platino, Master) basados en la cantidad de carreras completadas.
- **Acumulación de Puntos:** Los clientes ganan puntos por cada visita/carrera que pueden canjear por recompensas.
- **Cupones Automáticos:** Asignación automática de cupones por subir de nivel o como regalos de cumpleaños.
- **Membresías VIP:** Activación de membresías anuales con descuentos exclusivos en compras y renovaciones.
- **Panel Personalizado:** Un Dashboard donde cada cliente puede visualizar su progreso para el siguiente nivel, escanear su tarjeta digital (QR o número de cliente) y ver sus cupones activos.

### 🛡️ Para Administradores / Staff
- **Visualización de Analíticas:** Estadísticas de carreras totales, cupones creados y nivel de redención.
- **Gestión de Clientes:** Capacidad de registrar clientes nuevos, sumar o restar carreras manualmente.
- **Plantillas de Cupones:** Creación dinámica de cupones (descuentos fijos, porcentajes o carreras gratis), con la capacidad de filtrar el descuento a un nivel de lealtad en específico.
- **Canje de Recompensas:** Un módulo de punto de venta (POS) simulado para buscar cupones por código y marcarlos como "usados" de forma local.
- **Auditoría:** Historial detallado de qué empleado registró o eliminó una carrera o cupón.

## 🛠️ Stack Tecnológico (Versión Demo)

La aplicación original fue construida full-stack, pero para este repositorio de demostración se abstrajo la capa de backend:

- **Frontend:** React, TypeScript, Vite
- **Estilos:** Tailwind CSS, Shadcn-UI, Lucide Icons
- **Estado y Almacenamiento:** Módulo de simulación `mockData.ts` usando Web Storage API (`localStorage`) para comportarse como un gestor de base de datos sin fricción. No requiere configuración de `.env`.
- **Enrutamiento:** React Router Dom

## 🚀 Correr el Proyecto Localmente

Para iniciar esta demostración localmente, asegúrate de tener instalado Node.js en tu dispositivo.

1. Clona este repositorio:
   ```bash
   git clone <url-del-repositorio>
   ```

2. Entra al directorio del proyecto:
   ```bash
   cd go-kart-zen
   ```

3. Instala las dependencias:
   ```bash
   npm install
   ```

4. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. **Credenciales de Acceso:**  
   No se requiere registrarse para probar la demo. La pantalla de login generará un acceso de manera instantánea validando el nivel de permisos que decidas probar:
   - Ingresar como **Cliente** para ver el panel de recompensas.
   - Ingresar como **Admin/Staff** para ver el panel de gestión general.

## 📝 Notas de esta Versión
- Todas las interacciones, métricas y datos mostrados en este proyecto provienen de `localStorage`. Refrescar la página mantendrá tu sesión en caché, pero limpiar los datos del navegador borrará los cambios.
- La integración de WhatsApp se ha simulado mediante demoras asíncronas (`setTimeout`).
- El inicio de sesión real (*Supabase Auth*) fue reemplazado por almacenamiento local.
