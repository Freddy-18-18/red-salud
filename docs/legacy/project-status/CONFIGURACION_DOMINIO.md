# Configuración del Dominio red-salud.org con Vercel y Cloudflare

## Estado Actual
- ✅ Proyecto desplegado en Vercel: https://red-salud.vercel.app
- ⚠️ Dominio red-salud.org en Cloudflare con error SSL
- 🎯 Objetivo: Conectar red-salud.org a Vercel

## Paso 1: Agregar el dominio en Vercel

1. Ve a tu proyecto en Vercel: https://vercel.com/firf1818-8965s-projects/red-salud
2. Haz clic en "Settings" (Configuración)
3. Ve a la sección "Domains" (Dominios)
4. Haz clic en "Add" (Agregar)
5. Ingresa: `red-salud.org`
6. También agrega: `www.red-salud.org`
7. Vercel te mostrará los registros DNS que necesitas configurar

## Paso 2: Configurar DNS en Cloudflare

Vercel te dará dos opciones de configuración:

### Opción A: Usando CNAME (Recomendado)
Para `red-salud.org`:
- Tipo: `CNAME`
- Nombre: `@`
- Valor: `cname.vercel-dns.com`
- Proxy: ❌ Desactivado (DNS only)

Para `www.red-salud.org`:
- Tipo: `CNAME`
- Nombre: `www`
- Valor: `cname.vercel-dns.com`
- Proxy: ❌ Desactivado (DNS only)

### Opción B: Usando A Records
Si Cloudflare no permite CNAME en el root:
- Tipo: `A`
- Nombre: `@`
- Valor: `76.76.21.21`
- Proxy: ❌ Desactivado (DNS only)

## Paso 3: Configuración SSL en Cloudflare

1. Ve a Cloudflare Dashboard: https://dash.cloudflare.com
2. Selecciona tu dominio `red-salud.org`
3. Ve a SSL/TLS
4. Cambia el modo a: **Full (strict)** o **Full**
5. Espera unos minutos para que se propague

## Paso 4: Verificación

Una vez configurado:
1. Espera 5-10 minutos para propagación DNS
2. Vercel verificará automáticamente el dominio
3. El certificado SSL se generará automáticamente
4. Tu sitio estará disponible en https://red-salud.org

## Comandos útiles para verificar DNS

```bash
# Verificar registros DNS
nslookup red-salud.org

# Verificar CNAME
nslookup -type=CNAME red-salud.org

# Verificar propagación
dig red-salud.org
```

## Notas Importantes

⚠️ **IMPORTANTE**: Debes desactivar el proxy de Cloudflare (nube naranja) para los registros DNS que apuntan a Vercel. Esto es crucial para que Vercel pueda generar el certificado SSL correctamente.

✅ Una vez que el dominio esté verificado en Vercel, puedes activar el proxy de Cloudflare si lo deseas, pero primero debe verificarse.

## Solución de Problemas

### Error: Invalid SSL certificate
- Asegúrate de que el proxy de Cloudflare esté desactivado
- Verifica que el modo SSL en Cloudflare sea "Full" o "Full (strict)"
- Espera 24 horas para propagación completa

### Error: Domain not verified
- Verifica que los registros DNS estén correctos
- Usa `nslookup` para confirmar que apuntan a Vercel
- Espera unos minutos y reintenta la verificación en Vercel

## Contacto de Soporte

Si tienes problemas:
- Vercel Support: https://vercel.com/support
- Cloudflare Support: https://dash.cloudflare.com/?to=/:account/support
