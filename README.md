# CIVAN

![GitHub Tag](https://img.shields.io/github/v/tag/igCarlos/civan?label=versi%C3%B3n)
![Laravel](https://img.shields.io/badge/Laravel-12-red)
![PHP](https://img.shields.io/badge/PHP-%3E%3D8.2-blue)
![React](https://img.shields.io/badge/React-TypeScript-blue)
![Fortify](https://img.shields.io/badge/Laravel-Fortify-red)
![License](https://img.shields.io/github/license/igCarlos/civan)

Panel de administración desarrollado con **Laravel 12 + Inertia + React + TypeScript + Vite**.

CIVAN está orientado a la administración desde una interfaz web moderna. La versión actual incluye gestión de usuarios, roles y permisos, auditoría, configuración general del sistema, internacionalización Español/Inglés, personalización visual, branding dinámico, autenticación en dos pasos y administración de sesiones activas.

<p align="center">
  <img
    src="docs/images/civan-usuarios.png"
    alt="CIVAN - Gestión de usuarios"
    width="100%"
  >
</p>

<p align="center">
  <em>Vista del módulo de gestión de usuarios de CIVAN.</em>
</p>

---

# Tabla de contenido

1. [Características actuales](#características-actuales)
2. [Stack tecnológico](#stack-tecnológico)
3. [Instalación local recomendada](#instalación-local-recomendada)
4. [Requisitos antes de instalar](#requisitos-antes-de-instalar)
5. [Paso 1 - Instalar y preparar XAMPP](#paso-1---instalar-y-preparar-xampp)
6. [Paso 2 - Instalar Composer](#paso-2---instalar-composer)
7. [Paso 3 - Instalar Node.js y npm](#paso-3---instalar-nodejs-y-npm)
8. [Paso 4 - Instalar Git](#paso-4---instalar-git)
9. [Paso 5 - Descargar CIVAN](#paso-5---descargar-civan)
10. [Paso 6 - Instalar dependencias de PHP](#paso-6---instalar-dependencias-de-php)
11. [Paso 7 - Instalar dependencias frontend](#paso-7---instalar-dependencias-frontend)
12. [Paso 8 - Crear el archivo .env](#paso-8---crear-el-archivo-env)
13. [Paso 9 - Crear la base de datos en XAMPP](#paso-9---crear-la-base-de-datos-en-xampp)
14. [Paso 10 - Configurar la base de datos](#paso-10---configurar-la-base-de-datos)
15. [Paso 11 - Generar APP_KEY](#paso-11---generar-app_key)
16. [Paso 12 - Ejecutar migraciones](#paso-12---ejecutar-migraciones)
17. [Paso 13 - Crear el storage link](#paso-13---crear-el-storage-link)
18. [Paso 14 - Sincronizar permisos](#paso-14---sincronizar-permisos)
19. [Paso 15 - Crear el primer administrador](#paso-15---crear-el-primer-administrador)
20. [Paso 16 - Limpiar cachés](#paso-16---limpiar-cachés)
21. [Paso 17 - Ejecutar CIVAN](#paso-17---ejecutar-civan)
22. [Paso 18 - Comprobar la instalación](#paso-18---comprobar-la-instalación)
23. [Autenticación y seguridad](#autenticación-y-seguridad)
24. [Autenticación en dos pasos - 2FA](#autenticación-en-dos-pasos---2fa)
25. [Sesiones y dispositivos](#sesiones-y-dispositivos)
26. [Rate Limit con Fortify](#rate-limit-con-fortify)
27. [Storage, logos y favicon](#storage-logos-y-favicon)
28. [Configuración inicial de CIVAN](#configuración-inicial-de-civan)
29. [Sistema de apariencia](#sistema-de-apariencia)
30. [Auditoría](#auditoría)
31. [Comandos útiles en XAMPP](#comandos-útiles-en-xampp)
32. [Solución de problemas](#solución-de-problemas)
33. [Checklist final](#checklist-final)
34. [Buenas prácticas para GitHub](#buenas-prácticas-para-github)
35. [Instalación resumida](#instalación-resumida)

---

# Características actuales

La versión actual de CIVAN incluye:

- Dashboard administrativo.
- Gestión de usuarios.
- Creación, edición y eliminación de usuarios.
- Estados de usuario:
  - Activo.
  - Pendiente.
  - Suspendido.
- Seguimiento de presencia:
  - En línea.
  - Ausente.
  - Desconectado.
- Último inicio de sesión.
- Última actividad.
- Historial de actividad individual.
- Roles.
- Permisos.
- Integración con `spatie/laravel-permission`.
- Sincronización automática de permisos.
- Protección del rol `administrador`.
- Auditoría de acciones importantes.
- Exportación de auditoría:
  - CSV.
  - Excel.
  - PDF.
- Retención configurable de auditoría.
- Configuración general del sistema.
- Nombre dinámico del panel.
- Nombre corto.
- Zona horaria configurable.
- Formato de fecha y hora.
- Registros por página.
- Idiomas:
  - Español.
  - English.
- Personalización de apariencia:
  - color principal;
  - color del sidebar;
  - sidebar normal o redondeado;
  - fondo global;
  - color de cards;
  - cards sólidas;
  - Glassmorphism.
- Branding:
  - logo para modo claro;
  - logo para modo oscuro;
  - favicon;
  - tamaño configurable del logo.
- Favicon dinámico.
- Logo adaptativo según apariencia clara/oscura.
- Diseño responsive.

## Seguridad y autenticación

- Laravel Fortify.
- Rate Limit para autenticación.
- Autenticación en dos pasos `2FA`.
- Compatible con aplicaciones TOTP:
  - Google Authenticator.
  - Microsoft Authenticator.
  - Authy.
  - otras aplicaciones compatibles.
- Código QR para configurar 2FA.
- Clave manual para configurar 2FA.
- Confirmación mediante código TOTP de 6 dígitos.
- Challenge 2FA durante el inicio de sesión.
- Códigos de recuperación.
- Regeneración de códigos de recuperación.
- Desactivación de 2FA.
- Gestión de sesiones y dispositivos.
- Identificación de la sesión actual.
- Navegador y sistema operativo de cada sesión.
- Dirección IP.
- Última actividad.
- Cierre de sesiones específicas.
- Cierre de las demás sesiones conservando la actual.

---

# Stack tecnológico

## Backend

- PHP `>= 8.2`
- Laravel 12
- Laravel Fortify
- MySQL / MariaDB
- Spatie Laravel Permission
- PhpSpreadsheet
- DomPDF

## Frontend

- React
- TypeScript
- Inertia.js
- Vite
- Tailwind CSS
- componentes estilo shadcn/ui
- Lucide Icons

## Herramientas locales

- XAMPP
- Composer 2.x
- Node.js
- npm
- Git
- PowerShell

---

# Instalación local recomendada

Esta guía utiliza **Windows + XAMPP**.

La ubicación utilizada en los ejemplos es:

```text
C:\xampp\htdocs\appwebs\civan
```

La aplicación se ejecutará en desarrollo mediante:

```text
Laravel → http://localhost:8000
Vite    → servidor de desarrollo automático
MySQL   → XAMPP
PHP     → XAMPP
```

> Durante desarrollo se recomienda utilizar `php artisan serve` junto con `npm run dev`. XAMPP proporciona PHP y MySQL. No es necesario configurar un VirtualHost de Apache para comenzar.

---

# Requisitos antes de instalar

Instala las herramientas en este orden:

| Orden | Requisito | Versión recomendada |
|---|---|---|
| 1 | XAMPP | versión con PHP 8.2+ |
| 2 | PHP | 8.2 o superior |
| 3 | MySQL/MariaDB | incluido con XAMPP |
| 4 | Composer | 2.x |
| 5 | Node.js | 20 o superior |
| 6 | npm | incluido con Node.js |
| 7 | Git | versión reciente |

Requisitos mínimos recomendados:

| Recurso | Recomendación |
|---|---|
| CPU | 2 núcleos |
| RAM | 4 GB |
| Espacio libre | 2 GB o más |
| Sistema | Windows 10/11 de 64 bits |

---

# Paso 1 - Instalar y preparar XAMPP

## 1. Instalar XAMPP

Instala XAMPP en:

```text
C:\xampp
```

Después abre:

```text
XAMPP Control Panel
```

Inicia:

```text
Apache
MySQL
```

MySQL debe quedar en estado:

```text
Running
```

Apache es útil para phpMyAdmin y otros proyectos locales.

## 2. Verificar PHP

Abre PowerShell:

```powershell
php -v
```

Debe mostrar PHP 8.2 o superior.

Si `php` no existe:

```powershell
where.exe php
```

Agrega al `PATH` de Windows:

```text
C:\xampp\php
```

Cierra PowerShell, vuelve a abrirlo y ejecuta:

```powershell
php -v
```

## 3. Comprobar qué php.ini utiliza PHP

```powershell
php --ini
```

Debe apuntar preferiblemente a:

```text
C:\xampp\php\php.ini
```

## 4. Habilitar extensiones PHP

Abre:

```text
C:\xampp\php\php.ini
```

Asegúrate de tener habilitadas las extensiones necesarias:

```ini
extension=curl
extension=fileinfo
extension=gd
extension=mbstring
extension=mysqli
extension=openssl
extension=pdo_mysql
extension=zip
```

Además CIVAN/Laravel puede necesitar:

```text
bcmath
ctype
dom
filter
iconv
intl
json
session
simplexml
tokenizer
xml
xmlreader
xmlwriter
```

Verifica:

```powershell
php -m
```

Ejemplos:

```powershell
php -m | findstr pdo_mysql
php -m | findstr mbstring
php -m | findstr curl
php -m | findstr zip
php -m | findstr gd
php -m | findstr openssl
```

Después de cambiar `php.ini`, reinicia Apache desde XAMPP.

## 5. Configuración recomendada de PHP

En:

```text
C:\xampp\php\php.ini
```

usa al menos:

```ini
memory_limit = 256M
upload_max_filesize = 8M
post_max_size = 16M
max_execution_time = 120
max_input_time = 120
```

Reinicia Apache.

---

# Paso 2 - Instalar Composer

Instala Composer para Windows.

Durante la instalación, cuando solicite PHP, selecciona:

```text
C:\xampp\php\php.exe
```

Comprueba:

```powershell
composer --version
```

También puedes verificar:

```powershell
where.exe composer
```

---

# Paso 3 - Instalar Node.js y npm

Instala Node.js 20 o superior.

Comprueba:

```powershell
node -v
npm -v
```

Ejemplo:

```text
v20.x.x
10.x.x
```

---

# Paso 4 - Instalar Git

Instala Git para Windows.

Comprueba:

```powershell
git --version
```

---

# Paso 5 - Descargar CIVAN

Ve a la carpeta donde guardarás los proyectos:

```powershell
cd C:\xampp\htdocs\appwebs
```

Clona el repositorio:

```powershell
git clone https://github.com/igCarlos/civan.git
```

Entra al proyecto:

```powershell
cd civan
```

Comprueba:

```powershell
Get-Location
```

Debe ser parecido a:

```text
C:\xampp\htdocs\appwebs\civan
```

Si descargaste un ZIP, extrae CIVAN en:

```text
C:\xampp\htdocs\appwebs\civan
```

y luego:

```powershell
cd C:\xampp\htdocs\appwebs\civan
```

---

# Paso 6 - Instalar dependencias de PHP

Dentro de CIVAN:

```powershell
composer install
```

Este comando instalará automáticamente las dependencias definidas en `composer.lock`, incluyendo Laravel Fortify y las demás librerías utilizadas por CIVAN.

> No ejecutes `composer require laravel/fortify` en una instalación normal del proyecto si Fortify ya aparece en `composer.lock`.

Si Composer indica que falta una extensión PHP:

1. abre `C:\xampp\php\php.ini`;
2. habilita la extensión;
3. reinicia Apache;
4. cierra/reabre PowerShell;
5. ejecuta nuevamente:

```powershell
composer install
```

---

# Paso 7 - Instalar dependencias frontend

Si el repositorio contiene:

```text
package-lock.json
```

utiliza:

```powershell
npm ci
```

Si no existe:

```powershell
npm install
```

Para comprobar:

```powershell
npm list --depth=0
```

---

# Paso 8 - Crear el archivo .env

Copia:

```powershell
Copy-Item .env.example .env
```

Comprueba:

```powershell
Test-Path .env
```

Debe devolver:

```text
True
```

Usa como base:

```env
APP_NAME=CIVAN
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

APP_LOCALE=es
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=es_ES

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=civan
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120

CACHE_STORE=database

QUEUE_CONNECTION=database

FILESYSTEM_DISK=local
```

## Importante: sesiones

CIVAN utiliza:

```env
SESSION_DRIVER=database
```

No cambies esto a `file` si quieres utilizar correctamente:

```text
Configuración
└── Sesiones y dispositivos
```

El módulo utiliza la tabla:

```text
sessions
```

---

# Paso 9 - Crear la base de datos en XAMPP

Asegúrate de que MySQL esté iniciado en XAMPP.

Abre:

```text
http://localhost/phpmyadmin
```

Selecciona:

```text
Nueva
```

Crea:

```text
civan
```

Collation recomendada:

```text
utf8mb4_unicode_ci
```

También puedes hacerlo desde SQL:

```sql
CREATE DATABASE civan
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

---

# Paso 10 - Configurar la base de datos

En `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=civan
DB_USERNAME=root
DB_PASSWORD=
```

Esta configuración corresponde a una instalación local típica de XAMPP.

Si configuraste una contraseña para `root`, utiliza:

```env
DB_PASSWORD=TU_CONTRASENA
```

Después de cambiar `.env`:

```powershell
php artisan optimize:clear
```

---

# Paso 11 - Generar APP_KEY

Ejecuta:

```powershell
php artisan key:generate
```

Debe aparecer un mensaje indicando que la clave fue creada correctamente.

Comprueba:

```powershell
php artisan about
```

---

# Paso 12 - Ejecutar migraciones

Primero comprueba la conexión:

```powershell
php artisan migrate:status
```

En una instalación nueva puede indicar que todavía existen migraciones pendientes.

Ejecuta:

```powershell
php artisan migrate
```

Las migraciones deben crear las tablas necesarias para CIVAN, incluyendo las relacionadas con:

```text
users
sessions
cache
jobs
roles
permissions
system_settings
auditoría
2FA
```

## Verificar tabla de sesiones

```powershell
php artisan db:table sessions
```

Debe contener al menos:

```text
id
user_id
ip_address
user_agent
payload
last_activity
```

## Verificar columnas 2FA

Puedes comprobarlas:

```powershell
php artisan tinker --execute="dump(
    \Illuminate\Support\Facades\Schema::hasColumn('users', 'two_factor_secret'),
    \Illuminate\Support\Facades\Schema::hasColumn('users', 'two_factor_recovery_codes'),
    \Illuminate\Support\Facades\Schema::hasColumn('users', 'two_factor_confirmed_at')
);"
```

El resultado esperado es:

```text
true
true
true
```

---

# Paso 13 - Crear el storage link

Ejecuta:

```powershell
php artisan storage:link
```

Se creará:

```text
public/storage
→ storage/app/public
```

Comprueba:

```powershell
Test-Path public\storage
```

Si Windows no permite crear el enlace:

1. abre PowerShell como administrador; o
2. activa Developer Mode en Windows.

Después vuelve a ejecutar:

```powershell
php artisan storage:link
```

---

# Paso 14 - Sincronizar permisos

Limpia caché:

```powershell
php artisan optimize:clear
```

Después:

```powershell
php artisan permissions:sync-models --force
```

Comprueba los comandos disponibles:

```powershell
php artisan list
```

Si tu instalación utiliza comandos adicionales del paquete de permisos, pueden existir:

```powershell
php artisan table-permissions:install --migrate
php artisan table-permissions:restore
```

> Ejecuta únicamente comandos que aparezcan realmente en `php artisan list`.

---

# Paso 15 - Crear el primer administrador

Si la instalación está completamente vacía:

```powershell
php artisan tinker
```

Dentro:

```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

Role::firstOrCreate([
    'name' => 'administrador',
    'guard_name' => 'web',
]);

$user = User::create([
    'name' => 'Administrador',
    'username' => 'Administrador01',
    'email' => 'admin@example.com',
    'status' => 'active',
    'password' => Hash::make('CAMBIA_ESTA_CONTRASENA'),
]);

$user->assignRole('administrador');
```

Salir:

```php
exit
```

> El `username` debe respetar las reglas actuales de CIVAN. Utiliza uno con mayúsculas, minúsculas y números.

Cambia inmediatamente:

```text
admin@example.com
CAMBIA_ESTA_CONTRASENA
```

por credenciales propias y seguras.

---

# Paso 16 - Limpiar cachés

Ejecuta:

```powershell
php artisan optimize:clear
```

Comprueba configuración:

```powershell
php artisan about
```

---

# Paso 17 - Ejecutar CIVAN

Necesitas **dos terminales**.

## Terminal 1 - Laravel

```powershell
cd C:\xampp\htdocs\appwebs\civan
php artisan serve
```

Debería mostrar:

```text
http://127.0.0.1:8000
```

o abre:

```text
http://localhost:8000
```

## Terminal 2 - Vite

```powershell
cd C:\xampp\htdocs\appwebs\civan
npm run dev
```

Mantén las dos terminales abiertas.

## XAMPP

En XAMPP mantén:

```text
MySQL → Running
```

Apache también puede permanecer iniciado para phpMyAdmin.

---

# Paso 18 - Comprobar la instalación

Ejecuta estos comandos uno por uno:

```powershell
php artisan about
```

```powershell
php artisan migrate:status
```

```powershell
php artisan route:list
```

```powershell
php artisan route:list --path=login -v
```

```powershell
php artisan route:list --path=two-factor -v
```

```powershell
php artisan route:list --path=settings/sessions -v
```

```powershell
php artisan db:table sessions
```

Después abre:

```text
http://localhost:8000
```

Comprueba:

```text
Login
Dashboard
Usuarios
Roles
Permisos
Auditoría
Configuración
2FA
Sesiones y dispositivos
```

---

# Autenticación y seguridad

CIVAN utiliza Laravel Fortify como parte de su backend de autenticación.

La arquitectura actual es:

```text
Fortify
├── Login
├── Rate Limit de login
├── 2FA
├── Two Factor Challenge
├── Recovery Codes
└── Rate Limit de 2FA

CIVAN
├── Roles y permisos
├── Auditoría
├── Control de usuario activo
└── Sesiones y dispositivos
```

## Fortify

Fortify se instala automáticamente mediante:

```powershell
composer install
```

No es necesario volver a ejecutar:

```text
composer require laravel/fortify
```

si el paquete ya existe en las dependencias del repositorio.

Puedes comprobarlo:

```powershell
composer show laravel/fortify
```

---

# Autenticación en dos pasos - 2FA

CIVAN incluye autenticación TOTP mediante Fortify.

## Características

- Activar 2FA.
- Mostrar QR.
- Mostrar clave manual.
- Confirmar código de 6 dígitos.
- Challenge durante el login.
- Recovery codes.
- Copiar códigos.
- Descargar códigos.
- Regenerar códigos.
- Desactivar 2FA.

## Comprobar rutas

```powershell
php artisan route:list --path=two-factor
```

Deben existir rutas similares a:

```text
GET|HEAD  two-factor-challenge
POST      two-factor-challenge
POST      user/two-factor-authentication
DELETE    user/two-factor-authentication
GET|HEAD  user/two-factor-qr-code
GET|HEAD  user/two-factor-recovery-codes
POST      user/two-factor-recovery-codes
```

## Flujo de login

```text
Email + contraseña
        ↓
Credenciales correctas
        ↓
¿2FA activo?
   ├── NO → Dashboard
   │
   └── SÍ
        ↓
/two-factor-challenge
        ↓
Código Authenticator
        ↓
Dashboard
```

## Aplicaciones compatibles

Por ejemplo:

```text
Google Authenticator
Microsoft Authenticator
Authy
```

## Comprobar 2FA de un usuario

```powershell
php artisan tinker
```

Dentro:

```php
$user = App\Models\User::find(1);

$user->two_factor_confirmed_at;

$user->two_factor_secret !== null;
```

Nunca publiques:

```text
two_factor_secret
two_factor_recovery_codes
```

---

# Sesiones y dispositivos

CIVAN utiliza sesiones en base de datos.

En `.env`:

```env
SESSION_DRIVER=database
SESSION_LIFETIME=120
```

La tabla `sessions` contiene:

```text
id
user_id
ip_address
user_agent
payload
last_activity
```

El módulo permite:

- ver las sesiones activas;
- identificar la sesión actual;
- detectar navegador;
- detectar sistema operativo;
- detectar escritorio, móvil o tablet;
- mostrar IP;
- mostrar última actividad;
- cerrar una sesión específica;
- cerrar las demás sesiones conservando la actual.

Ruta principal:

```text
/settings/sessions
```

Comprobar:

```powershell
php artisan route:list --path=settings/sessions -v
```

## Probar múltiples sesiones

1. Inicia sesión en Edge.
2. Abre Chrome o una ventana privada.
3. Inicia sesión nuevamente con la misma cuenta.
4. Abre:

```text
http://localhost:8000/settings/sessions
```

Ahora CIVAN debe mostrar más de una sesión.

---

# Rate Limit con Fortify

El Rate Limit de autenticación está centralizado en Fortify.

Se utiliza para proteger principalmente:

```text
Login
2FA
```

El login utiliza el limiter nombrado:

```text
login
```

Puedes comprobar la ruta:

```powershell
php artisan route:list --path=login -v
```

El `POST login` debe mostrar:

```text
throttle:login
```

Cuando se supera el límite, CIVAN intercepta el `429 Too Many Requests` de Inertia y muestra una alerta visual en lugar del modal de error predeterminado.

Las operaciones administrativas como usuarios, roles, permisos, auditoría y configuración **no utilizan los Rate Limiters personalizados antiguos**.

---

# Storage, logos y favicon

CIVAN permite subir:

- logo para modo claro;
- logo para modo oscuro;
- favicon.

Los archivos se almacenan bajo:

```text
storage/app/public
```

Para hacerlos públicos:

```powershell
php artisan storage:link
```

Esto crea:

```text
public/storage
→ storage/app/public
```

## Logos

Formatos:

```text
PNG
JPG
JPEG
WEBP
```

Máximo recomendado/configurado:

```text
5 MB
```

## Favicon

Formatos:

```text
PNG
JPG
JPEG
WEBP
ICO
```

Máximo recomendado/configurado:

```text
2 MB
```

Resoluciones recomendadas:

```text
32x32
64x64
128x128
```

---

# Configuración inicial de CIVAN

Después de entrar con el administrador, revisa:

```text
Configuración
```

## Perfil

- nombre;
- correo;
- verificación del correo.

## Contraseña

- contraseña actual;
- contraseña nueva;
- confirmación;
- reglas de seguridad.

## Autenticación 2FA

- activar;
- QR;
- código;
- recovery codes.

## Sesiones y dispositivos

- sesión actual;
- otras sesiones;
- IP;
- navegador;
- plataforma;
- última actividad.

## Apariencia

- tema;
- colores;
- fondo;
- cards.

## Sistema

- identidad;
- branding;
- regional;
- preferencias globales.

---

# Sistema de apariencia

La configuración visual se almacena en `system_settings`.

Ejemplos:

```text
system.panel_name
system.short_name

system.logo_light
system.logo_dark
system.favicon
system.logo_size

system.primary_color

system.sidebar_color
system.sidebar_shape

system.background_color_mode
system.background_color

system.card_color_mode
system.card_color
system.card_style

system.timezone
system.locale
system.date_format
system.time_format
system.per_page
```

## Sidebar

```text
normal
rounded
```

## Fondo

```text
auto
custom
```

## Cards

Modo:

```text
auto
custom
```

Estilo:

```text
solid
glass
```

`glass` activa Glassmorphism.

---

# Auditoría

CIVAN registra acciones administrativas importantes.

Entre los eventos pueden encontrarse:

```text
login
logout
create
update
delete
role_change
status_change
permission_change
permission_sync
audit_export
audit_prune
audit_retention_update
page_view
system_settings_update
```

Los logs pueden contener:

- actor;
- evento;
- módulo;
- descripción;
- valores anteriores;
- valores nuevos;
- IP;
- método HTTP;
- ruta;
- URL;
- user-agent;
- fecha.

## Privacidad

Nunca registres datos como:

```text
password
password_confirmation
two_factor_secret
two_factor_recovery_codes
tokens
secret keys
API secrets
```

---

# Comandos útiles en XAMPP

Todos los ejemplos se ejecutan desde:

```powershell
cd C:\xampp\htdocs\appwebs\civan
```

## Laravel

```powershell
php artisan about
```

## Limpiar cachés

```powershell
php artisan optimize:clear
```

## Ver rutas

```powershell
php artisan route:list
```

## Ver login

```powershell
php artisan route:list --path=login -v
```

## Ver 2FA

```powershell
php artisan route:list --path=two-factor -v
```

## Ver sesiones

```powershell
php artisan route:list --path=settings/sessions -v
```

## Ver tabla sessions

```powershell
php artisan db:table sessions
```

## Ver migraciones

```powershell
php artisan migrate:status
```

## Ejecutar migraciones

```powershell
php artisan migrate
```

## Sincronizar permisos

```powershell
php artisan permissions:sync-models --force
```

## Storage

```powershell
php artisan storage:link
```

## Iniciar Laravel

```powershell
php artisan serve
```

## Iniciar Vite

```powershell
npm run dev
```

## Build

```powershell
npm run build
```

## PHP

```powershell
php -v
php -m
php --ini
```

## Composer

```powershell
composer --version
composer show
```

## Fortify

```powershell
composer show laravel/fortify
```

## Node

```powershell
node -v
npm -v
```

## Git

```powershell
git --version
```

---

# Solución de problemas

## Pantalla blanca

Primero abre:

```text
F12
→ Console
```

Busca el primer error rojo.

Después ejecuta:

```powershell
npm install
php artisan optimize:clear
npm run dev
```

Si Vite estaba abierto, ciérralo con:

```text
Ctrl + C
```

y vuelve a iniciarlo:

```powershell
npm run dev
```

Recarga con:

```text
Ctrl + F5
```

---

## Vite manifest not found

Ejecuta:

```powershell
npm install
npm run build
```

En desarrollo utiliza:

```powershell
npm run dev
```

---

## No conecta con MySQL

Asegúrate de que MySQL esté:

```text
Running
```

en XAMPP.

Comprueba:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=civan
DB_USERNAME=root
DB_PASSWORD=
```

Después:

```powershell
php artisan optimize:clear
php artisan migrate:status
```

---

## Unknown database

Abre:

```text
http://localhost/phpmyadmin
```

y crea:

```text
civan
```

o ejecuta:

```sql
CREATE DATABASE civan
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

---

## Access denied for user root

Verifica si MySQL de XAMPP tiene contraseña para root.

Ajusta:

```env
DB_USERNAME=root
DB_PASSWORD=
```

o coloca la contraseña configurada.

Luego:

```powershell
php artisan optimize:clear
```

---

## php no reconocido

Ejecuta:

```powershell
where.exe php
```

Agrega:

```text
C:\xampp\php
```

al `PATH`.

---

## Composer utiliza otro PHP

Comprueba:

```powershell
php -v
where.exe php
composer diagnose
```

Composer debe utilizar una versión compatible con PHP 8.2+.

---

## Falta una extensión PHP

Ejemplo:

```text
ext-gd is missing
ext-zip is missing
```

Abre:

```text
C:\xampp\php\php.ini
```

habilita la extensión, reinicia Apache y ejecuta:

```powershell
php -m
composer install
```

---

## Cambié .env pero Laravel sigue usando valores viejos

```powershell
php artisan optimize:clear
```

---

## Logo o favicon no aparece

```powershell
php artisan storage:link
```

Comprueba:

```powershell
Test-Path public\storage
```

También verifica:

```env
APP_URL=http://localhost:8000
```

---

## Error al subir logos

En:

```text
C:\xampp\php\php.ini
```

comprueba:

```ini
upload_max_filesize = 8M
post_max_size = 16M
```

Reinicia Apache.

---

## Error 403 en Usuarios, Roles o Permisos

Sincroniza permisos:

```powershell
php artisan permissions:sync-models --force
php artisan optimize:clear
```

Comprueba desde Tinker:

```powershell
php artisan tinker
```

```php
$user = App\Models\User::find(1);

$user->getRoleNames();

$user->getAllPermissions()->pluck('name');
```

---

## 2FA no aparece al iniciar sesión

Comprueba:

```powershell
php artisan route:list --path=two-factor
```

Después:

```powershell
php artisan tinker
```

```php
$user = App\Models\User::find(1);

$user->two_factor_confirmed_at;

$user->two_factor_secret !== null;
```

Si está correctamente configurado, al iniciar sesión debe ocurrir:

```text
/login
↓
/two-factor-challenge
↓
/dashboard
```

---

## Error TwoFactorChallengeViewResponse is not instantiable

Comprueba que `FortifyServiceProvider` registre la vista del challenge 2FA.

Después:

```powershell
php artisan optimize:clear
```

---

## Código 2FA correcto pero termina en 404

Comprueba:

```powershell
php artisan tinker --execute="dump(config('fortify.home'));"
```

Para CIVAN debe apuntar al dashboard, por ejemplo:

```text
/dashboard
```

Después:

```powershell
php artisan optimize:clear
```

---

## Sesiones y dispositivos no muestra datos

Comprueba `.env`:

```env
SESSION_DRIVER=database
```

Después:

```powershell
php artisan optimize:clear
```

Comprueba la tabla:

```powershell
php artisan db:table sessions
```

Y las rutas:

```powershell
php artisan route:list --path=settings/sessions -v
```

---

## Sesiones y dispositivos muestra solo una sesión

Eso significa normalmente que solo existe una sesión activa para tu usuario.

Para probar:

1. inicia sesión en Edge;
2. inicia sesión en Chrome/Incógnito;
3. recarga `/settings/sessions`.

---

## Error 429 Too Many Requests

El Rate Limit de autenticación está funcionando.

CIVAN debe mostrar su alerta visual para el `429`.

Si vuelve a aparecer el modal oscuro de Inertia:

1. reinicia Vite;
2. limpia caché;
3. recarga completamente.

```powershell
php artisan optimize:clear
npm run dev
```

---

## Hora incorrecta

Configura la zona horaria desde CIVAN.

Ejemplo:

```text
America/Managua
```

No modifiques manualmente timestamps de la base.

---

## Configuración visual se pierde al recargar

Comprueba que:

- `SystemSettingsService` lea la configuración;
- `HandleInertiaRequests` comparta `system`;
- `app.tsx` aplique `applySystemAppearance()`;
- existan los valores en `system_settings`.

---

## Error 500

Abre:

```text
storage\logs\laravel.log
```

En PowerShell:

```powershell
Get-Content storage\logs\laravel.log -Tail 100
```

Para seguir el log:

```powershell
Get-Content storage\logs\laravel.log -Wait
```

---

# Checklist final

Comprueba todo en orden:

- [ ] XAMPP instalado.
- [ ] Apache inicia.
- [ ] MySQL inicia.
- [ ] PHP 8.2+ funciona.
- [ ] `php --ini` utiliza el PHP correcto.
- [ ] Extensiones PHP habilitadas.
- [ ] Composer instalado.
- [ ] Node.js instalado.
- [ ] npm instalado.
- [ ] Git instalado.
- [ ] Repositorio clonado.
- [ ] `composer install` completado.
- [ ] `npm ci` o `npm install` completado.
- [ ] `.env` creado.
- [ ] Base de datos `civan` creada.
- [ ] `.env` conectado a MySQL de XAMPP.
- [ ] `APP_KEY` generado.
- [ ] `SESSION_DRIVER=database`.
- [ ] Migraciones ejecutadas.
- [ ] Tabla `sessions` creada.
- [ ] Columnas 2FA creadas.
- [ ] `storage:link` creado.
- [ ] Permisos sincronizados.
- [ ] Administrador creado.
- [ ] Caché limpiada.
- [ ] `php artisan serve` funciona.
- [ ] `npm run dev` funciona.
- [ ] Login funciona.
- [ ] Dashboard abre.
- [ ] Usuarios abre.
- [ ] Roles abre.
- [ ] Permisos abre.
- [ ] Auditoría abre.
- [ ] Configuración guarda.
- [ ] Branding funciona.
- [ ] Apariencia se conserva al recargar.
- [ ] 2FA puede activarse.
- [ ] QR de 2FA aparece.
- [ ] Challenge 2FA funciona.
- [ ] Recovery codes funcionan.
- [ ] Rate Limit de login funciona.
- [ ] Sesiones y dispositivos abre.
- [ ] Sesión actual se identifica correctamente.
- [ ] Otras sesiones pueden cerrarse.
- [ ] Build frontend funciona.

Build:

```powershell
npm run build
```

---

# Buenas prácticas para GitHub

## Nunca subir .env

Debe estar ignorado:

```gitignore
.env
.env.*
!.env.example
```

## No subir dependencias

```text
/vendor
/node_modules
```

Se reconstruyen con:

```powershell
composer install
npm ci
```

## Sí versionar locks

```text
composer.lock
package-lock.json
```

## No publicar secretos 2FA

Nunca subas ni muestres:

```text
two_factor_secret
two_factor_recovery_codes
```

## No subir archivos generados por usuarios

No uses Git como almacenamiento de:

```text
storage/app/public
```

## Mantener .env.example actualizado

Debe incluir, como mínimo:

```env
APP_NAME=CIVAN
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=civan
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120
```

---

# Estructura general importante

```text
civan/
├── app/
│   ├── Actions/
│   ├── Http/
│   │   ├── Controllers/
│   │   ├── Middleware/
│   │   └── Requests/
│   ├── Models/
│   ├── Providers/
│   ├── Services/
│   └── ...
│
├── bootstrap/
│
├── config/
│   └── fortify.php
│
├── database/
│   ├── migrations/
│   └── seeders/
│
├── public/
│
├── resources/
│   ├── css/
│   ├── js/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── layouts/
│   │   ├── lib/
│   │   └── pages/
│   │       ├── auth/
│   │       └── settings/
│   └── views/
│
├── routes/
│   ├── auth.php
│   ├── settings.php
│   └── web.php
│
├── storage/
│
├── tests/
│
├── .env.example
├── artisan
├── composer.json
├── composer.lock
├── package.json
├── package-lock.json
└── vite.config.ts
```

---

# Instalación resumida

> Esta sección es un resumen. Para una instalación nueva se recomienda seguir primero todos los pasos anteriores en orden.

## 1. XAMPP

Inicia:

```text
MySQL
Apache
```

## 2. PowerShell

```powershell
cd C:\xampp\htdocs\appwebs

git clone https://github.com/igCarlos/civan.git

cd civan

composer install

npm ci

Copy-Item .env.example .env
```

Si `npm ci` no puede ejecutarse porque no existe `package-lock.json`:

```powershell
npm install
```

## 3. Crear la base de datos

En:

```text
http://localhost/phpmyadmin
```

crea:

```text
civan
```

## 4. Configurar .env

```env
APP_NAME=CIVAN
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=civan
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120
```

## 5. Preparar Laravel

```powershell
php artisan key:generate

php artisan migrate

php artisan storage:link

php artisan optimize:clear

php artisan permissions:sync-models --force
```

## 6. Crear administrador si es necesario

```powershell
php artisan tinker
```

Crea el usuario y asigna el rol `administrador`.

## 7. Terminal Laravel

```powershell
php artisan serve
```

## 8. Terminal Vite

```powershell
npm run dev
```

## 9. Abrir CIVAN

```text
http://localhost:8000
```

## 10. Comprobación final

```powershell
php artisan about
php artisan migrate:status
php artisan route:list --path=login -v
php artisan route:list --path=two-factor -v
php artisan route:list --path=settings/sessions -v
php artisan db:table sessions
```

---

# Nota final

Antes de subir una nueva versión de CIVAN a GitHub comprueba:

```powershell
composer install
npm ci
php artisan migrate:status
php artisan route:list
php artisan permissions:sync-models --force
npm run build
php artisan optimize:clear
```

Si todos los comandos terminan sin errores, la instalación local está correctamente preparada.

---

**CIVAN** — Panel de administración.
