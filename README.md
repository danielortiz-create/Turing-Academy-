# Turing Academy

Plataforma de cursos en línea de ingeniería (primer curso: **Oracle Primavera P6**).
Construida con Next.js (cliente + servidor), PostgreSQL + Prisma, NextAuth y Stripe.

## Funcionalidades

- 🎓 Catálogo de cursos con módulos y lecciones en video
- 🔐 Inicio de sesión con **correo/contraseña o Google (Gmail)**
- 🎬 Videos protegidos: la URL solo se entrega a usuarios que compraron el curso
  (compatible con YouTube, Vimeo o archivos MP4 alojados en el servidor)
- 💳 Pagos con **Stripe Checkout**
- 📈 Progreso del estudiante (lecciones completadas, barra de avance)
- 🛠️ Panel de administración: crear/editar cursos, módulos, lecciones y ver ventas

## Requisitos

- Node.js 20+ (la base de datos es un archivo local SQLite — no hay que instalar nada más)

## Puesta en marcha

```bash
npm install
npm run dev
```

Eso es todo. Al arrancar, `npm run dev` crea automáticamente la base de datos
(`prisma/dev.db`) y carga el curso de ejemplo con el usuario administrador.
Abre http://localhost:3000.

### Cuenta de administrador

El seed crea un usuario admin con el correo definido en `ADMIN_EMAIL`
(contraseña inicial: `admin1234` — cámbiala). Además, cualquier cuenta que se
registre con ese mismo correo (incluido login con Google) recibe rol de
administrador automáticamente.

## Configuración de servicios externos

### Google (inicio de sesión con Gmail)

1. Ve a https://console.cloud.google.com/apis/credentials
2. Crea un **OAuth Client ID** (tipo: aplicación web)
3. Agrega como URI de redirección: `https://tu-dominio.com/api/auth/callback/google`
   (en desarrollo: `http://localhost:3000/api/auth/callback/google`)
4. Copia el Client ID y el Client Secret a `.env`

### Stripe (pagos)

1. Copia tu clave secreta desde https://dashboard.stripe.com/apikeys a `STRIPE_SECRET_KEY`
2. Crea un webhook en https://dashboard.stripe.com/webhooks apuntando a
   `https://tu-dominio.com/api/webhooks/stripe` con el evento `checkout.session.completed`
3. Copia el secreto del webhook a `STRIPE_WEBHOOK_SECRET`
4. En desarrollo puedes usar `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Videos

Cada lección tiene un proveedor de video:

- **YouTube**: sube el video como *no listado* y guarda su ID (lo que va después de `v=`)
- **Vimeo**: guarda el ID numérico del video
- **MP4**: coloca el archivo en `storage/videos/` y guarda el nombre del archivo

En los tres casos la URL solo se entrega a usuarios con acceso al curso: el
reproductor la pide a `/api/lessons/:id/video`, que valida sesión y compra.

## Estructura

```
prisma/            Esquema de base de datos y seed
src/lib/           Prisma, NextAuth, Stripe, control de acceso
src/app/api/       API: auth, registro, checkout, webhook, video protegido
src/app/           Páginas: inicio, cursos, lección, login, registro, mis-cursos
src/app/admin/     Panel de administración (solo rol ADMIN)
storage/videos/    Videos MP4 autoalojados (no se suben a git)
```

## Despliegue

Para producción se recomienda cambiar la base de datos a **PostgreSQL**
(Neon, Supabase, Railway…): en `prisma/schema.prisma` cambia el `datasource`
a `provider = "postgresql"` con `url = env("DATABASE_URL")` y ejecuta
`npx prisma db push`. Cualquier plataforma que soporte Next.js funciona:
**Railway**, **Render**, **Vercel**, o un VPS. Configura en producción las
variables de `.env.example` (especialmente `NEXTAUTH_SECRET`).
