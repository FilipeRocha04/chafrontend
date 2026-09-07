# Chá da Maya — lista de presentes colaborativa

Um convite digital em formato de aplicativo de celular: delicado, em aquarela, com borboletas, flores, folhas e tons de rosa, creme e verde suave. Nada de loja, preço ou carrinho.

## O que o convidado vê

**Início (/)**
- "Chá da Maya 🦋", subtítulo e o recado da mamãe Bella.
- Botão grande "Ver listinha de presentes".
- Borboleta rosa, florzinhas, folhas e coraçõezinhos nas bordas, sem poluir.

**Listinha (/lista)**
- Filtros no topo: Todos · Fraldas · Mimos para Maya · Mimos para mamãe.
- Cada presente em um card arredondado: nome, tamanho (quando houver), "X unidades já escolhidas" e botão "Eu vou levar 💕".
- Vários convidados podem escolher o mesmo presente; o app só soma as unidades.

**Escolher (janela que sobe de baixo)**
- "Você escolheu: …"
- "Quantas unidades você pretende levar?" com seletor [-] 1 [+].
- "Como podemos identificar você?" — nome opcional.
- "Confirmar meu presente 💕" → tela de agradecimento com "Continuar escolhendo".
- Sem login, sem cadastro.

## Área da mamãe (/admin)

- Login protegido, fora da navegação dos convidados.
- Resumo no topo: presentes prometidos, quantidade total de itens, número de participantes.
- Resumo por categoria com barrinhas simples de quantidade.
- Ao tocar em um presente: lista de quem prometeu (nome ou "Não identificado") e quanto.
- Gerenciar a listinha: adicionar, editar, remover, mudar categoria, mudar tamanho, ativar/desativar e ver quantidades — sem mexer em código.

## Visual e uso no celular

- Pensado primeiro para telas de 360–430px; no computador o conteúdo fica centralizado em até 600px, com cara de app.
- Botões grandes, textos bem legíveis, sombras muito sutis, cantos arredondados.
- Nenhuma tabela na área dos convidados; confirmação sempre com um retorno visual carinhoso.
- Linguagem afetiva: "Eu vou levar", "Já escolheram", "Confirmar meu presente".
- Ilustrações de aquarela (borboleta, flores, folhas) geradas para o app e usadas como detalhes de borda.

## Itens iniciais

Já cadastrados na abertura: as 4 fraldas (RN, P, M, G), os 19 mimos para a Maya da lista enviada e "Higiene pessoal pós-parto e outros" em Mimos para mamãe Bella.

## Detalhes técnicos

- Ativar Lovable Cloud (banco de dados + login da mamãe).
- Tabelas: `categories` (id, name, display_order, created_at), `gift_items` (id, category_id, name, size, description, active, display_order, created_at), `gift_commitments` (id, gift_item_id, guest_name, quantity, created_at). Categorias e itens iniciais entram por INSERT na migração.
- Contagem sempre por soma de `gift_commitments.quantity` — sem contador fixo no item.
- Segurança: leitura pública de categorias e itens ativos; convidado pode inserir uma promessa (com limite de quantidade) mas não ler as promessas de outros — a tela pública recebe só os totais, por função no servidor. Detalhes de quem prometeu e o gerenciamento da lista exigem a mamãe autenticada.
- Login da mamãe por e-mail e senha; acesso restrito por papel de administradora em tabela própria (nunca no perfil), verificado no servidor.
- Rotas: `/` (início), `/lista`, `/admin` (login + painel), com título e descrição próprios para compartilhamento.
- Paleta e tipografia delicadas definidas como tokens no sistema de design, sem cores fixas nos componentes.

## Perguntas depois de aprovar

Preciso do e-mail que a Bella vai usar para entrar na área da mamãe (a senha ela mesma define no primeiro acesso).
