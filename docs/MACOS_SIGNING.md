# macOS Code Signing & Notarization

Guía para firmar y notarizar la app con cuenta individual de Apple Developer, de modo que los clientes puedan instalarla sin el mensaje "app no identificada".

---

## Requisitos previos

- Cuenta activa en [developer.apple.com](https://developer.apple.com) (Individual, $99/año)
- Xcode o Xcode Command Line Tools instalado
- macOS para hacer el build (la firma solo funciona en macOS)

---

## Paso 1 — Crear el certificado "Developer ID Application"

1. Ve a **developer.apple.com → Certificates, Identifiers & Profiles → Certificates**
2. Haz clic en **+** para crear uno nuevo
3. Selecciona **Developer ID Application** (NO "Mac App Distribution", ese es solo para App Store)
4. En "Select a Developer ID Certificate Intermediary", selecciona **G2 Sub-CA (Xcode 11.4.1 or later)** — es la opción moderna, NO "Previous Sub-CA"
5. Genera el CSR desde tu Mac antes de subir el archivo:
   - Abre **Keychain Access** (búscalo en Spotlight). En macOS Sequoia/Sonoma puede aparecer un popup "Manage Your Passwords in the New Passwords App" — haz clic en **"Open Keychain Access"** (botón gris), no en "Open Passwords"
   - Al instalar el `.cer`, macOS pregunta en qué keychain agregarlo — selecciona **"login"**, no "iCloud". El proceso de firma busca certificados en el keychain local
   - Una vez dentro: **menú Certificate Assistant → Request a Certificate from a Certificate Authority...**
   - **User Email Address**: rogercastanedag@gmail.com
   - **Common Name**: Roger Castañeda
   - **CA Email Address**: dejar vacío
   - **Request is**: selecciona **"Saved to disk"**
   - Guarda el `.certSigningRequest` generado
6. Sube el `.certSigningRequest` en el portal con "Choose File" y haz clic en Continue
7. Descarga el `.cer` generado y haz doble clic para instalarlo en tu Keychain

Verifica que está correctamente instalado:

```bash
security find-identity -v -p codesigning
```

Debes ver una línea similar a:

```
2) B930EEF4B8FDFCC7B0F8FC26ACC65DC796460FC3 "Developer ID Application: Roger Castaneda (Z579L5VDW5)"
```

---

## Paso 2 — Generar una App-Specific Password

Esta password es para que el proceso automatizado de notarización pueda autenticarse con Apple sin usar tu contraseña real.

1. Ve a [appleid.apple.com](https://appleid.apple.com)
2. Sign-In and Security → **App-Specific Passwords**
3. Genera una con nombre descriptivo como `electron-notarize`
4. Copia y guarda la password — solo se muestra una vez (formato: `xxxx-xxxx-xxxx-xxxx`)

---

## Paso 3 — Tu Team ID

Tu Team ID es: **Z579L5VDW5**

(Confirmado en developer.apple.com → Account, visible como "Roger Castaneda - Z579L5VDW5")

---

## Paso 4 — Configurar variables de entorno

Agrega estas variables a tu shell (`~/.zshrc` o equivalente) o a un archivo `.env` local. **No las commitees al repositorio.**

```bash
export APPLE_ID="tu@email.com"
export APPLE_TEAM_ID="Z579L5VDW5"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-xxxx-xxxx-xxxx"
```

Si usas `.env`, asegúrate de que está en `.gitignore`.

---

## Paso 5 — Crear el archivo de entitlements

Electron necesita permisos especiales para ejecutarse correctamente con Hardened Runtime activo. Crea el archivo `entitlements.plist` en la raíz del proyecto:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.disable-library-validation</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
</dict>
</plist>
```

---

## Paso 6 — Actualizar forge.config.js

Reemplaza el `packagerConfig` actual con:

```js
packagerConfig: {
  asar: true,
  name: 'Lucia Arana Work Management',
  executableName: 'luciaarana-work',
  appBundleId: 'com.luciaarana.workmanagement',
  appCategoryType: 'public.app-category.productivity',
  // icon: './assets/icon', // Descomentar cuando haya ícono (.icns para macOS)
  osxSign: {
    identity: 'Developer ID Application: Roger Castañeda (Z579L5VDW5)', // <-- confirmar con: security find-identity -v -p codesigning
    entitlements: './entitlements.plist',
    'entitlements-inherit': './entitlements.plist',
    'hardened-runtime': true,
  },
  osxNotarize: {
    tool: 'notarytool',
    appleId: process.env.APPLE_ID,
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
    teamId: process.env.APPLE_TEAM_ID,
  },
},
```

> **Nota**: `osxSign` y `osxNotarize` vienen incluidos en `@electron-forge/maker-dmg` y el packager de Electron Forge — no requieren instalar paquetes adicionales en versiones recientes de Electron Forge 7.x.

---

## Paso 7 — Hacer el build firmado

```bash
pnpm run make
```

El proceso hace automáticamente:
1. Compila la app con Vite
2. Empaqueta con Electron Forge
3. Firma todos los binarios con tu certificado Developer ID
4. Sube la app a los servidores de Apple para notarización (tarda ~3-10 min)
5. Adjunta el ticket de notarización al `.dmg`

El artefacto final estará en:
```
out/make/Lucia Arana Work Management.dmg
```

---

## Verificar que la firma es correcta

Antes de enviar al cliente, verifica:

```bash
# Verificar firma del .app
codesign --verify --deep --strict --verbose=2 "out/Lucia Arana Work Management-darwin-arm64/Lucia Arana Work Management.app"

# Verificar notarización del .dmg
spctl --assess --type open --context context:primary-signature --verbose "out/make/Lucia Arana Work Management.dmg"
```

Debe responder `accepted` o `source=Notarized Developer ID`.

---

## Troubleshooting

### Error: "No identity found"
- El certificado no está instalado en el Keychain o está expirado
- Verifica con `security find-identity -v -p codesigning`
- Asegúrate de que el string en `identity` coincide exactamente

### Error durante notarización: "Invalid credentials"
- Verifica que `APPLE_ID`, `APPLE_TEAM_ID` y `APPLE_APP_SPECIFIC_PASSWORD` estén correctamente seteadas
- La App-Specific Password expira si cambias tu contraseña de Apple ID — genera una nueva

### Error: "The executable does not have the hardened runtime enabled"
- Asegúrate de tener `'hardened-runtime': true` en `osxSign`
- Verifica que el `entitlements.plist` existe y tiene el contenido correcto

### El cliente recibe "app dañada" o "no se puede verificar"
- El `.dmg` no fue notarizado correctamente
- Verifica los logs del proceso `make` buscando el resultado de la notarización
- Puedes consultar el estado de notarización con: `xcrun notarytool history --apple-id $APPLE_ID --team-id $APPLE_TEAM_ID --password $APPLE_APP_SPECIFIC_PASSWORD`

---

## Flujo resumido

```
1. Crear certificado "Developer ID Application" en developer.apple.com
        ↓
2. Generar App-Specific Password en appleid.apple.com
        ↓
3. Configurar variables de entorno (APPLE_ID, APPLE_TEAM_ID, APPLE_APP_SPECIFIC_PASSWORD)
        ↓
4. Crear entitlements.plist en la raíz del proyecto
        ↓
5. Actualizar forge.config.js (osxSign + osxNotarize)
        ↓
6. pnpm run make
        ↓
7. Verificar con codesign / spctl
        ↓
8. Enviar .dmg al cliente
```
