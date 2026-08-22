# Groupify — Spec-Driven Development

> **Não há código sem spec** (para trabalho não-trivial).

## Estrutura

```
specs/
├── constitution.md            ← Princípios inegociáveis (leia primeiro!)
├── README.md                  ← Este arquivo
└── <NNN>-<slug>/              ← Um diretório por feature/spec
    ├── spec.md                ← O QUÊ e POR QUÊ
    ├── plan.md                ← O COMO (arquitetura)
    ├── tasks.md               ← Checklist de implementação
    └── review.md              ← Relatório de review (após impl)
```

## Numeração

`001-<slug>`, `002-<slug>`, ... **NUNCA** reutilizar números.

- Os diretórios `*-template/` são **modelos vazios** prontos para uso. Renomeie
  para `<NNN>-<slug-real>` e preencha quando definir os requisitos.
- Comece o número de onde o último spec terminou (continue a sequência).

## Regras

- **Não há código sem spec** (para trabalho não-trivial — ≥20 linhas ou mudança
  em contrato público: props, store actions, API contracts, exported APIs)
- **Specs são documentos vivos** — atualize quando entendimento muda
- **Reference specs em commits e PRs**: `Refs: specs/NNN-slug/`
- **Não amplie escopo silenciosamente** — atualize o spec ou divida

## Fluxo SDD

```
[Human] → SPEC (WHAT) → PLAN (HOW) → TASKS (WHEN) → CODE (DO) → REVIEW → MERGE
```

## Onde Olhar

| Preciso de... | Arquivo |
|---|---|
| Princípios inegociáveis | `constitution.md` |
| Estrutura e regras | `README.md` (este arquivo) |
| Modelo vazio para começar | `specs/001-template/` |
