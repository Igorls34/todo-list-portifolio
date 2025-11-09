# Meu Portfólio Pessoal

## Favicon Variants

O projeto inclui três versões de favicon em `assets/imagens/`:

- `favicon.svg` (padrão): fundo azul #0D6EFD com símbolo </> branco.
- `favicon-dark.svg`: fundo cinza-escuro (#1e1e1e) com símbolo em azul (uso opcional para tema escuro).
- `favicon-outline.svg`: apenas contorno arredondado azul e símbolo </> minimalista (ideal para superfícies claras).

Para trocar o favicon principal, edite a tag `<link rel="icon" ...>` em `index.html` apontando para o arquivo desejado.

```html
<!-- Exemplo usando outline -->
<link rel="icon" type="image/svg+xml" href="assets/imagens/favicon-outline.svg">
```

Se desejar compatibilidade extra com navegadores legados, converta o SVG para `.ico` (64x64 ou 32x32) e adicione:

```html
<link rel="icon" type="image/x-icon" href="assets/imagens/favicon.ico">
```

## Como Servir o Projeto Localmente (Windows PowerShell)

```powershell
cd C:\Users\User\Desktop\Portifólio-Pessoal
python -m http.server 8000
# Depois abra http://localhost:8000
```

Alternativa com Node (se instalado):

```powershell
npx serve .
```

Ou use a extensão "Live Server" no VS Code (botão "Go Live").

## Envio para Google Sheets

Editar `js/config.js` com a URL do Web App do Google Apps Script:

```javascript
export const SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/SEU_ID/exec';
```

O formulário usa:

- Honeypot (`website`) e tempo mínimo de preenchimento (3s)
- Spinner ao enviar
- Fallback `no-cors` se houver bloqueio CORS

## Licença

Projeto pessoal sem licença formal; você pode se inspirar no layout e lógica, mas evite copiar conteúdo textual integral sem crédito.
