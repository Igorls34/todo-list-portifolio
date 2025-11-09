# Roadmap V2 – Portfólio Igor Laurindo

> Versão atual (V1) pronta para deploy. Este documento guarda melhorias planejadas para a próxima versão.

## Objetivo Geral
Evoluir segurança, performance, acessibilidade, conteúdo (projetos reais) e observabilidade, mantendo simplicidade e baixo acoplamento.

## Backlog de Itens

| Nº | Item | Descrição / Critério de Aceite | Prioridade |
|----|------|--------------------------------|------------|
| 1  | Token via Script Properties | Mover token para Script Properties (SHEETS_TOKEN). `doPost` lê PropertiesService e rejeita quando inválido. | Alta |
| 2  | Validações server-side formulário | Honeypot, `elapsed_ms >= 3000`, validar email, truncar campos (nome<=120, mensagem<=2000). Respostas JSON: `ok`, `honeypot`, `too_fast`, `invalid_email`. | Alta |
| 3  | Rate limit Apps Script | Limitar eventos por `session_id+ua` (ex.: 30/min). Usar CacheService. Registrar bloqueios em aba `Logs`. | Média |
| 4  | Realtime seletivo tracker | Realtime só para `page_view`, `form_submit`, `modal_open/close`. Demais em batch (10s). Whitelist configurável. | Média |
| 5  | sendBeacon no beforeunload | Tentativa extra de flush da fila usando `navigator.sendBeacon` antes de sair. | Média |
| 6  | OG image e metadados | Criar `assets/imagens/og-image.png (1200x630)`. Validar no Facebook/Twitter Card Validator. | Alta |
| 7  | Sitemap e robots | Adicionar `sitemap.xml` e `robots.txt`; incluir URL definitiva do domínio. | Média |
| 8  | Minificar CSS e JS | Pipeline (esbuild/terser + cssnano). Meta: Lighthouse Performance > 90. | Alta |
| 9  | Otimizar imagens/SVG | Usar Squoosh / SVGO. Considerar `srcset` para thumbs dos projetos. | Média |
| 10 | PWA com Workbox | Substituir SW simples por Workbox: cache-first assets, network-first HTML, offline fallback. | Média |
| 11 | Acessibilidade modal | `aria-modal="true"`, `aria-labelledby`, trap de foco, retorno ao botão de origem, skip link global. | Alta |
| 12 | Adicionar 3–5 projetos | Cards com thumb otimizada, stack, resumo, links GitHub/demo. | Alta |
| 13 | Projetos via JSON dinâmico | Criar `assets/projects.json`; renderizar dinamicamente para facilitar manutenção. | Média |
| 14 | Dashboards KPIs planilha | Aba com gráficos: page_views, taxa clique links, conversão formulário, funil scroll. | Baixa |
| 15 | Privacidade & consentimento | Toggle para desativar tracking (persistir em localStorage) + nota de privacidade. | Média |
| 16 | README v2 | Documentar deploy, PWA, segurança Apps Script, tracker, como adicionar projetos. | Alta |

## Prioridades Imediatas (Top 5)
1. Segurança (Itens 1–2)
2. Conteúdo real (Item 12)
3. Performance (Item 8)
4. Acessibilidade (Item 11)
5. OG image para social (Item 6)

## Sequência Sugerida
1. Ajustar Apps Script (token + validações + rate limit básico).  
2. Criar estrutura de projetos (`projects.json` + seção dinâmica).  
3. Otimizar e minificar assets (gera baseline para Lighthouse).  
4. Acessibilidade do modal e adicionar skip link.  
5. SEO social (OG image).  
6. Refinar tracker (realtime seletivo, sendBeacon).  
7. PWA avançado com Workbox.  
8. Privacidade/consentimento.  
9. Dashboards de métricas e README v2 final.

## Estrutura Esperada de `projects.json`
```jsonc
[
  {
    "id": "proj-site-cursos",
    "titulo": "Plataforma de Cursos",
    "descricao": "Aplicação web para gestão de aulas, inscrições e progresso do aluno.",
    "stack": ["HTML", "CSS", "JS", "Apps Script"],
    "tags": ["educação", "dashboard"],
    "github": "https://github.com/usuario/repositorio",
    "demo": "https://meudominio.com/cursos",
    "thumb": "assets/imagens/projetos/cursos-thumb.webp"
  }
]
```

## Snippet de Trap de Foco (Referência)
```javascript
function trapFocus(modal) {
  const focusable = modal.querySelectorAll('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
```

## Rate Limit (Esboço Apps Script)
```javascript
function canProceed(sessionId, ua) {
  var key = (sessionId || 'anon') + '|' + (ua || 'no_ua');
  var cache = CacheService.getScriptCache();
  var raw = cache.get(key);
  var count = raw ? parseInt(raw, 10) : 0;
  if (count > 30) return false; // limite por minuto
  cache.put(key, String(count + 1), 60); // expira em 60s
  return true;
}
```

## Indicadores para Dashboard
- Conversão: envios formulário / page_views.
- Engajamento scroll: média máxima % atingida.
- Cliques externos: CTR por link (GitHub, LinkedIn, etc.).
- Tempo médio de preenchimento (elapsed_ms).

## Notas
- Manter tokens fora do versionamento público (Script Properties).  
- Reavaliar nomes de colunas antes de inserir painéis e fórmulas.  
- Considerar compressão GZIP/Brotli no host (Netlify/Vercel já faz).  

---
Gerado em: 2025-11-09
