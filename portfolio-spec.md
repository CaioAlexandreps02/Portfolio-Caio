# Portfólio Caio Porto — Especificação Completa

## Visão Geral

Site de portfólio profissional para Caio Porto, profissional de Marketing com atuação em design gráfico, vídeo, social media, sistemas e desenvolvimento de sites. O objetivo é centralizar todos os projetos em um único lugar com apresentação visual profissional.

**Finalidades do portfólio:**
- Conseguir clientes freelance
- Impressionar em processos seletivos (CLT)
- Mostrar trabalho para parceiros e empresas

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js (App Router) |
| Banco de dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Deploy | Vercel |
| Estilo | Tailwind CSS |

---

## Identidade Visual

- **Tema:** Dark mode e Light mode com toggle acessível
- **Paleta:** A definir — mas deve refletir identidade profissional de marketing criativo
- **Tom:** Moderno, direto, com personalidade — não genérico/template

---

## Tipos de Projeto

Os projetos são categorizados pelos seguintes tipos:

1. **Design Gráfico** — peças, campanhas visuais, identidades
2. **Vídeo** — edições, reels, vídeos institucionais
3. **Sistemas** — softwares, plataformas, ferramentas internas
4. **Sites** — landing pages, sites institucionais, portfólios
5. **Social Media** — gestão de perfis, conteúdo, estratégia de redes

---

## Estrutura de Páginas

### `/` — Home (pública)

- **Hero:** nome, título profissional, frase de impacto e CTA ("Ver projetos" / "Falar comigo")
- **Projetos em Destaque:** cards dos projetos marcados como `featured` (3–6 projetos)
- **Todos os Projetos:** grid com filtro por tipo (Design Gráfico, Vídeo, Sistemas, Sites, Social Media)
- **Rodapé:** links de contato e redes sociais

### `/sobre` — Sobre mim (pública)

- Foto e bio pessoal/profissional
- Habilidades e ferramentas que domina (ex: Figma, Premiere, After Effects, Next.js, Supabase)
- Trajetória resumida

### `/projetos/[slug]` — Página individual do projeto (pública)

- Capa / imagem principal
- Galeria de imagens e/ou embed de vídeo
- Título, tipo, descrição e contexto do projeto
- Métricas e resultados (quando houver)
- Link externo (site, sistema, repositório — quando aplicável)
- Botão de voltar / navegação entre projetos

---

## Sistema de Administração

> O admin **não é um painel separado** — é o mesmo site público. A conta do Caio, ao fazer login, ativa controles de edição inline nas páginas existentes.

### Comportamento autenticado

- Botão de edição aparece sobre os cards de projeto na home
- Página de projeto ganha controles para editar campos diretamente
- Aparece botão "Novo projeto" flutuante ou na navbar
- Toggle de status (rascunho / publicado / arquivado) acessível inline
- Navbar autenticada ganha acesso a "Configurações" (`/admin/configuracoes`) e "Links" (`/admin/links`)

### Páginas exclusivas do admin

Algumas funcionalidades ficam em páginas separadas, acessíveis só para o usuário autenticado:

#### `/admin/projetos/novo` — Cadastrar projeto
Campos:
- Título
- Slug (gerado automaticamente, editável)
- Tipo (Design Gráfico / Vídeo / Sistemas / Sites / Social Media)
- Descrição
- Imagem de capa — campo de texto onde o Caio cola o link de compartilhamento do Google Drive (o sistema converte pro formato direto automaticamente, ver "Hospedagem de Mídia")
- Galeria de imagens adicionais — mesma lógica, um campo por link colado, podendo adicionar vários. Cada imagem colada aparece numa lista com miniatura, com **arrastar para reordenar** (a ordem da lista define a ordem salva em `media_urls`) e botão de **remover** por imagem
- Link de vídeo (YouTube)
- Métricas / resultados: campo de texto livre (`metrics`) + lista de destaques estruturados label/valor, com botão "adicionar destaque" (`metrics_highlights` — ex: Alcance: 120k, ROI: 3.2x)
- Link externo
- Destaque? (featured — sim/não)
- Ordem de exibição (`sort_order`) — campo numérico simples por enquanto
- Status (rascunho / publicado / arquivado)

#### `/admin/projetos/[slug]/editar` — Editar projeto existente
- Mesmos campos do cadastro, pré-preenchidos

#### `/admin/configuracoes` — Configurações do site
- Editar bio e foto da página "Sobre" (`site_settings.about_bio` / `about_photo_url`)
- Editar links de contato: WhatsApp, LinkedIn, e-mail (`site_settings`)
- Gerenciar ordem dos projetos em destaque (lista arrastável dos projetos com `featured = true`, grava em `sort_order`)

#### `/admin/links` — Links rastreáveis
- Lista dos links criados (`tracked_links`), com código, destino, projeto associado (se houver) e contagem de cliques
- Criar novo link: label, código (sugestão automática a partir do label, editável), destino (URL própria ou selecionar um projeto), gera o link final `caio-portfolio.vercel.app/go/[code]`
- Sem edição de contagem (é só leitura) — só pode editar destino/label ou excluir o link

---

## Hospedagem de Mídia

Decisão: **não usar Supabase Storage** para imagens/vídeos dos projetos, pra não consumir o limite do plano gratuito.

### Imagens — Google Drive

- **Estrutura de pastas:** `Portfolio/[slug-do-projeto]/` — uma pasta por projeto, mantendo a organização que o Caio já usa.
- **Permissão obrigatória:** cada arquivo (ou a pasta inteira, por herança) precisa estar como **"Qualquer pessoa com o link pode visualizar"** — sem isso a imagem não carrega no site.
- **Fluxo no admin:** o Caio cola o link de compartilhamento normal do Drive (formato `.../file/d/FILE_ID/view?usp=sharing`) no campo de imagem. O formulário extrai o `FILE_ID` automaticamente e monta a URL direta salva no banco: `https://drive.google.com/uc?export=view&id=FILE_ID`. O Caio nunca precisa montar essa URL manualmente.
- **Otimização:** o Next.js (`next/image`) é configurado com `images.remotePatterns` liberando `drive.google.com` e `lh3.googleusercontent.com`. Isso permite que o Next continue otimizando/redimensionando/cacheando essas imagens normalmente, mesmo vindo do Drive — resolve a falta de resize nativo do Drive.
- **Risco conhecido e aceito:** hotlink de imagens do Drive não é um uso oficialmente suportado pelo Google — pode ocasionalmente sofrer throttling em picos de tráfego. Aceitável para o volume esperado no lançamento. Plano B se der problema: migrar para Supabase Storage ou Cloudinary (ambos com free tier compatível).

### Vídeos — YouTube

- Vídeos (edições, institucionais, reels adaptados) sobem como **não listados** ou públicos no YouTube.
- O link do vídeo entra no campo `video_embed` do projeto, como já especificado.

### Foto da página "Sobre"

- Mesmo esquema das imagens de projeto: link do Google Drive, convertido pro formato direto, salvo em `site_settings.about_photo_url`.

### Editor do mockup 3D — navegador de pastas do Drive (decisão de 04/08/2026, revisada em 14/08/2026)

- Exceção ao fluxo de "colar link": no editor visual do folder (`/admin/projetos/novo|editar`, quando `print_piece_type = 'folder'`), cada uma das 4 partes é escolhida via um **modal próprio de navegação do Google Drive**, não por link colado.
- **Revisão de 14/08/2026:** o Google Picker nativo foi substituído por um modal construído do zero (`DriveFolderBrowserModal`) que navega pela árvore de pastas do Drive via chamadas server-side à Drive API — a navegação fica **travada dentro de uma pasta raiz configurável** (`site_settings.google_drive_root_folder_id`) e suas subpastas; não dá pra sair dela. Mostra todos os tipos de arquivo (não só imagens) ao navegar. Motivo da troca: o Picker nativo do Google mostra o Drive inteiro do Caio, sem como restringir a navegação a uma pasta específica.
- **A própria pasta raiz também é escolhida pelo mesmo modal** (não por link colado): em Configurações → Integrações → "Selecionar pasta", o modal abre em modo `folder` navegando o Drive inteiro a partir de `root` (sem restrição, já que ainda não existe raiz definida) e mostra um botão "Selecionar esta pasta" que salva a pasta em que o Caio está navegando no momento. Depois de definida, todo o resto do sistema (editor do mockup) só enxerga essa pasta e suas subpastas.
- Rotas server-side: `GET /api/google/drive/list?folderId=` (lista pastas/arquivos de uma pasta específica — aceita o alias especial `root` pra listar a raiz de "Meu Drive"; sem `folderId` resolve a pasta raiz já configurada) e `POST /api/google/drive/select` (torna o arquivo escolhido público e devolve a URL direta — usado só ao escolher arquivos, não pastas). O access token do Drive nunca é exposto ao navegador — todas as chamadas à Drive API acontecem no servidor.
- O restante do site (capa de projeto, galeria, foto do "Sobre") continua no fluxo de colar link — esse modal é só pro editor do mockup 3D por agora.

### Conexão persistente com o Google Drive (decisão de 04/08/2026)

- Em vez de autorizar a cada uso (popup de consentimento toda hora), o Caio conecta **uma vez** em `/admin/configuracoes` → seção "Integrações" → "Conectar Google Drive".
- Fluxo OAuth **authorization code** (redirecionamento, não popup):
  - `/api/auth/google/start` — gera um `state` (proteção CSRF, guardado num cookie httpOnly de 5min) e redireciona pro consentimento do Google (`access_type=offline`, `prompt=consent` — garante que sempre volta um `refresh_token`).
  - `/api/auth/google/callback` — valida o `state`, troca o `code` pelos tokens, guarda o `refresh_token`.
- **`refresh_token` guardado na tabela `google_drive_connection`, sem NENHUMA policy de RLS** — só a service role (uso server-side) consegue ler/escrever. Nunca trafega pro navegador.
- As rotas `/api/google/drive/list` e `/api/google/drive/select` usam o `refresh_token` guardado pra buscar um `access_token` novo (validade curta, ~1h) a cada chamada — sem popup, sem fricção.
- Credenciais no Google Cloud Console: **OAuth Client ID** (público, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`) + **Client Secret** (`GOOGLE_CLIENT_SECRET`, só server-side, nunca `NEXT_PUBLIC_`). Redirect URI precisa estar cadastrado no Cloud Console: `{SITE_URL}/api/auth/google/callback`. (`NEXT_PUBLIC_GOOGLE_API_KEY` era usado só pelo Picker nativo — não é mais necessário desde a revisão de 14/08/2026, mas não tem problema deixar configurado.)
- Escopo OAuth usado: `drive.file` (acesso só aos arquivos que o Caio efetivamente selecionar).
- Ao escolher um arquivo no modal, o app tenta automaticamente criar a permissão "qualquer um com o link pode visualizar" nele via API (`permissions.create`) — se isso falhar por alguma restrição da conta, o Caio precisa compartilhar esse arquivo manualmente.
- "Desconectar" revoga o token no Google (`/revoke`) e limpa o registro guardado.

---

## Banco de Dados — Supabase

### Tabela `projects`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Identificador único |
| `slug` | text (unique) | URL amigável |
| `title` | text | Título do projeto |
| `type` | enum | design / video / sistemas / sites / social_media |
| `description` | text | Descrição completa |
| `cover_url` | text | URL da imagem de capa (link direto do Google Drive) |
| `media_urls` | text[] | Array de URLs de mídia (imagens do Drive), na ordem de exibição da galeria |
| `video_embed` | text | URL de embed de vídeo do YouTube (opcional) |
| `metrics` | text | Descrição livre de métricas e resultados |
| `metrics_highlights` | jsonb | Destaques estruturados, array de `{ "label": "Alcance", "value": "120k" }`. Chaves livres por projeto (Alcance, Conversões, ROI, Período, etc.) |
| `external_url` | text | Link externo do projeto (opcional) |
| `featured` | boolean | Se aparece em destaque na home |
| `status` | enum | `draft` / `published` / `archived` |
| `sort_order` | integer | Ordem de exibição |
| `subcategory` | enum (opcional) | Subcategoria dentro do tipo `design`. Hoje só `impressos`. Não aparece como filtro público — é só organização/gatilho de funcionalidade no admin. |
| `print_piece_type` | enum (opcional) | Tipo de peça impressa dentro de `subcategory = 'impressos'`. Hoje só `folder`. Selecionar "Folder Impresso" no admin revela o editor visual do mockup 3D. |
| `print_mockup` | jsonb (opcional) | Mockup 3D de folder bifold (uma dobra, formato A4): `{ front_cover, back_cover, inner_left, inner_right }` — as 4 artes impressas (capa, contra-capa, interna esquerda, interna direita). Quando presente, a página do projeto renderiza o mockup 3D interativo (abre ao clicar, capa de frente / contra-capa visível ao orbitar por trás) no lugar/além da galeria normal. Decisão de 04/08/2026: não é uma categoria nova no filtro público — é um projeto comum do tipo `design`, só com esses campos preenchidos. |
| `created_at` | timestamp | Data de criação |
| `updated_at` | timestamp | Última atualização |

> **Nota:** o campo `published` (boolean) foi substituído por `status` (enum) para suportar os 3 estados definidos no Apêndice: rascunho, publicado e arquivado. Um boolean não consegue representar 3 estados.

### Tabela `site_settings` (singleton — uma única linha)

Usada pela página `/admin/configuracoes`.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | integer (fixo = 1) | Garante linha única |
| `about_bio` | text | Texto da página "Sobre" |
| `about_photo_url` | text | URL da foto (Google Drive) |
| `whatsapp_number` | text | Número usado no botão "Falar no WhatsApp" |
| `linkedin_url` | text | URL do perfil do LinkedIn |
| `email` | text | E-mail de contato |
| `google_drive_root_folder_id` | text | ID da pasta raiz do Drive em que o navegador de arquivos do editor de mockup fica travado |
| `updated_at` | timestamp | Última atualização |

### Tabela `tracked_links`

Suporte ao link rastreável com contagem de cliques.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid | Identificador único |
| `code` | text (unique) | Código curto usado na URL, ex: `bio-instagram` |
| `project_id` | uuid (FK `projects`, nullable) | Projeto associado (opcional — pode redirecionar pra home) |
| `label` | text | Nome interno pra identificar o link, ex: "Bio Instagram" |
| `destination_url` | text | URL de destino do redirecionamento |
| `click_count` | integer (default 0) | Contador de cliques, incrementado a cada acesso |
| `created_at` | timestamp | Data de criação |

**Rota pública:** `/go/[code]` — route handler que busca o `code`, incrementa `click_count` e responde com redirect (302) pra `destination_url`. É esse link (`caio-portfolio.vercel.app/go/bio-instagram`) que o Caio compartilha no WhatsApp/e-mail/redes.

### Autenticação

- Supabase Auth com login por e-mail/senha
- **Cadastro público desabilitado** — existe apenas a conta do Caio, criada manualmente no painel do Supabase (não pelo site). Não há fluxo de "criar conta" nem "esqueci minha senha" exposto na interface.
- Row Level Security (RLS) no Supabase:
  - Projetos com `status = 'published'` → leitura pública
  - Projetos com `status = 'draft'` ou `'archived'` → apenas usuário autenticado
  - `site_settings` → leitura pública (é o conteúdo da página "Sobre" e do rodapé), escrita apenas autenticado
  - `tracked_links` → leitura restrita ao autenticado (menos o próprio route handler de redirecionamento, que roda com service role); escrita apenas autenticado
  - Escrita/edição em todas as tabelas → apenas usuário autenticado

---

## Conteúdo que será exibido

- Fotos e imagens de campanhas e peças
- Vídeos (edições, reels, institucionais)
- Links de sites e sistemas desenvolvidos
- Métricas e resultados de campanhas

---

## Fluxo de Uso

### Visitante
1. Acessa a home → vê projetos em destaque
2. Filtra por tipo de projeto → clica em um card
3. Lê a página do projeto com galeria, descrição e métricas
4. Acessa "/sobre" para conhecer o profissional
5. Usa o contato no rodapé para entrar em contato

### Caio (autenticado)
1. Faz login → o site se comporta normalmente, mas com controles de edição visíveis
2. Clica em "Novo projeto" → preenche o formulário em `/admin/projetos/novo`
3. Publica ou salva como rascunho
4. Pode editar qualquer projeto diretamente pela página do projeto ou pela rota `/admin/projetos/[slug]/editar`

---

## Próximos Passos Sugeridos

1. Definir paleta de cores e tipografia
2. Criar projeto no Supabase e configurar as tabelas (`projects`, `site_settings`, `tracked_links`) + RLS
3. Criar conta/estrutura no Google Drive (`Portfolio/[slug]/`) e permissões de compartilhamento; criar canal/lista no YouTube para vídeos
4. Inicializar o projeto Next.js com Tailwind e Supabase client; configurar `images.remotePatterns` pro Google Drive
5. Desenvolver a home pública (hero + grid de projetos + filtros)
6. Desenvolver a página individual de projeto
7. Implementar autenticação (login único, sem signup) e lógica de edição inline
8. Criar formulário de cadastro/edição de projetos (com conversão automática de link do Drive)
9. Criar `/admin/configuracoes` e `/admin/links`
10. Criar rota `/go/[code]` de redirecionamento com contagem de cliques
11. Deploy no Vercel (`caio-portfolio`)

---

## Apêndice — Definições do Caio (03/08/2026)

### Domínio e Deploy

- Nome do projeto na Vercel: **`caio-portfolio`** → domínio `caio-portfolio.vercel.app`
- Não vai comprar domínio próprio

### Identidade Visual

- Sem referência específica de estilo, mas o Caio tem uma funcionalidade especial em mente para a parte de mostrar sites criados (a ser detalhada posteriormente)
- **Cor predominante: azul** — faz sentido pra identidade profissional de marketing, transmite confiança e modernidade. Não há restrições de cor, apenas preferência pelo azul como cor principal

### Contato

- Canais: **WhatsApp**, **LinkedIn** e **e-mail**
- Não terá formulário de contato inline — redirecionamento direto pro canal escolhido (botão "Falar no WhatsApp", link pro LinkedIn, link de e-mail)

### Conteúdo Inicial

- O Caio tem projetos em todas as 5 categorias (Design Gráfico, Vídeo, Sistemas, Sites, Social Media)
- Objetivo: pelo menos 1 projeto publicado em cada tipo no lançamento
- Maior volume provável: Design Gráfico
- Mídia: parcialmente organizada, ainda precisa reunir o restante

### Comportamento e UX

- **Galeria de imagens:** lightbox com clique + carrossel como padrão
- **Exceção para projetos do tipo "Sites":** scroll vertical de imagem comprida (layout storytelling, mais detalhes a serem definidos depois)
- **Filtros na home:** por tipo de projeto
- **Navegação entre projetos:** botão "próximo/anterior" (além do botão de voltar)

### Tags — removido

- Decisão de 03/08/2026: o sistema de tags foi removido do escopo. Não existe campo `tags` no schema, no formulário de admin nem na página de projeto. O único filtro na home é por tipo de projeto.

### SEO e Rastreamento

- **Google Analytics:** não será necessário
- **SEO orgânico:** sitemap.xml, robots.txt e Open Graph tags (para compartilhamento em redes sociais)
- **Link rastreável:** o Caio quer um link personalizado com rastreamento de cliques (para enviar por WhatsApp/e-mail e saber quantas pessoas acessaram) — estrutura definida em "Banco de Dados → Tabela `tracked_links`" e página `/admin/links`

### Performance

- **Estratégia: ISR (Incremental Static Regeneration)** — páginas geradas estaticamente com revalidação automática. Rápido como SSG, sempre atualizado sem precisar de redeploy manual.

### Acessibilidade

- Por enquanto sem preocupação específica além do toggle dark/light
- Manter boas práticas básicas (contraste, semântica HTML) como padrão técnico

### Gestão de Projetos (Admin)

- **Três status possíveis:** rascunho / publicado / arquivado
- **Exclusão:** disponível (exclusão permanente do banco)
- **Arquivamento:** projeto some da vista pública e da listagem, mas fica salvo no banco (pode ser restaurado depois)
- **Despublicação:** funciona como o "rascunho" atual — some da vista pública mas continua editável

### Métricas de Projeto (Híbrido)

- Campo de **texto livre** para descrição detalhada da campanha/resultados
- Campos-chave **estruturados** para destaque visual: "Alcance", "Conversões", "ROI", "Período" (ou outros que fizerem sentido por projeto)
- Permite flexibilidade (texto livre) + organização (campos-chave)
