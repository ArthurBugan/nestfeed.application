# Groupify — Constitution

> **Princípios inegociáveis para o desenvolvimento do Groupify.**
> Leia este arquivo antes de qualquer alteração.

## Regras Fundamentais

1. **Não há código sem spec** — Trabalho não-trivial (≥20 linhas ou mudança em
   contrato público: props, store actions, API contracts, exported types)
   exige spec aprovado.
2. **Testes não são opcionais** — ≥1 assert por requisito / novo comportamento.
3. **Secrets nunca no código** — `.env.local` (gitignored), nunca commitar
   chaves, tokens ou credenciais.
4. **Falhe alto, não silenciosamente** — `Error` com mensagem clara; use
   `catch`/resultados tratados, nunca deixar promises rejeitarem sem tratamento.
5. **Contratos públicos são imutáveis** — Breaking changes versionados com nota
   no spec e CHANGELOG.
6. **Não pule fases** — spec → plan → tasks → implement → review.

## Regras do Groupify (React Native)

7. **Estado com ZuStore, dados com React Query** — estado global efêmero no
   Zustand; dados server/cacheados no React Query (não duplicar em stores).
8. **Valide entrada com Zod** — toda fronteira (props, query params, response
   da API) validada antes de usar; `z.infer` para tipar.
9. **Navegação file-based** — rotas em `src/app/` via expo-router; não refatorar
   o fluxo de navegação sem spec.
10. **i18n em primeiro lugar** — strings externas para locale; não hardcodar
    texto na UI.
11. **Acessibilidade de série** — `accessibilityLabel`, hit target ≥44pt,
    suporte a Dynamic Size Text.

## Stack Imutável (MVP)

- **Client:** React Native 0.86 (Expo SDK 57)
- **Navigation:** expo-router
- **State:** Zustand + React Query (@tanstack/react-query)
- **Validation:** Zod
- **Language:** TypeScript (strict)
- **Tests:** Jest + React Testing Library

## Agentes

| Agente | Responsabilidade |
|--------|------------------|
| `leader` | Orquestrar fluxo, revisar specs |
| `spec_author` | Escrever specs de features |
| `architect` | Planos técnicos, decisões de arquitetura |
| `implementer` | Código de tarefas específicas |
| `reviewer` | Validar que tarefas estão completas e testadas |

## O Que NÃO Fazer

- Não inventar APIs/stores sem spec aprovado
- Não amplie escopo silenciosamente — atualize o spec
- Não pule lint/tests com flags de bypass
- Não commitar `.env.local` ou secrets
- Não vazar estado de cliente para React Query (e vice-versa)
- Não hardcodar strings em inglês na UI

---

**Status:** Vigente para MVP
