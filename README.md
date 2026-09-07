# Maya's Gift Garden

Crie um aplicativo web MOBILE FIRST para o "Chá da Maya", funcionando como uma lista de presentes colaborativa para um chá de bebê.

O aplicativo deve ser extremamente simples para os convidados usarem pelo celular através de um link ou QR Code.

IMPORTANTE SOBRE O DESIGN:

Use as imagens de referência anexadas como inspiração visual.

Quero uma identidade delicada, elegante e acolhedora de chá de bebê, inspirada em:

- borboletas em aquarela

- flores delicadas

- folhas verdes

- tons de rosa claro, rosa queimado, creme e verde suave

- fundo claro/off-white

- elementos florais principalmente nas bordas, sem poluir a interface

- cards arredondados

- sombras muito sutis

- aparência artesanal/elegante

- pequenos detalhes de coração

- tipografia delicada para títulos, mas extremamente legível para textos e botões

NÃO quero que pareça um dashboard corporativo, e-commerce ou aplicativo genérico de IA.

O aplicativo deve parecer um convite digital interativo do Chá da Maya.

==================================================

1. HOME

==================================================

Criar uma tela inicial bonita e emocional.

No topo:

"Chá da Maya 🦋"

Subtítulo:

"Estamos preparando tudo com muito carinho para a chegada da Maya."

Adicionar uma pequena mensagem:

"A mamãe Bella preparou uma listinha especial como sugestão. Escolha abaixo o que você gostaria de levar para o Chá da Maya. 💕"

Botão principal:

"Ver listinha de presentes"

Adicionar elementos visuais delicados inspirados nas referências:

- borboleta rosa

- pequenas flores

- folhas

- corações

Não exagerar nas ilustrações.

==================================================

2. LISTA DE PRESENTES

==================================================

A lista deve ser dividida em categorias.

Criar tabs/filtros no topo:

Todos

Fraldas

Mimos para Maya

Mimos para mamãe

Cada item deve aparecer em um card simples contendo:

Nome do item

Tamanho, quando existir

Quantidade já escolhida pelos convidados

Botão "Eu vou levar 💕"

Exemplo:

---------------------------------

🧷 Fralda descartável

Tamanho RN

3 unidades já escolhidas

[ Eu vou levar 💕 ]

---------------------------------

IMPORTANTE:

Não quero impedir duas pessoas de escolherem o mesmo produto.

O objetivo é contabilizar QUANTAS unidades de cada item serão recebidas.

==================================================

3. ITENS INICIAIS

==================================================

Categoria: FRALDAS

- Fraldas descartáveis RN

- Fraldas descartáveis P

- Fraldas descartáveis M

- Fraldas descartáveis G

Categoria: MIMOS PARA MAYA

- Lenço umedecido sem perfume

- Pomada para assadura

- Sabonete líquido cabeça aos pés neutro

- Fraldinha de boca

- Fralda de ombro

- Fralda passeio

- Toalha com capuz

- Kit mamadeira

- Body manga curta - P

- Body manga curta - M

- Body manga longa fino - P

- Body manga longa fino - M

- Mijão sem pé / shortinho - P

- Mijão sem pé / shortinho - M

- Mijão com pé fino - P

- Mijão com pé fino - M

- Macaquinho curto de tecido leve ou algodão - M

- Macacão longo fino de algodão - M

- Cueiros finos

Categoria: MIMOS PARA MAMÃE BELLA

- Higiene pessoal pós-parto e outros

==================================================

4. SELEÇÃO DO PRESENTE

==================================================

Ao clicar em "Eu vou levar", abrir um bottom sheet ou modal mobile.

Exemplo:

"Você escolheu:

Fraldas descartáveis - tamanho M"

Perguntar:

"Quantas unidades você pretende levar?"

Criar seletor:

[-]  1  [+]

Depois perguntar opcionalmente:

"Como podemos identificar você?"

Campo:

"Seu nome"

O nome deve ser opcional.

Botão:

"Confirmar meu presente 💕"

Depois da confirmação mostrar:

"Obrigada! 💕

Seu carinho vai fazer parte desse momento tão especial."

Botão:

"Continuar escolhendo"

O convidado pode escolher MAIS DE UM item.

==================================================

5. CONTAGEM

Cada escolha precisa atualizar a quantidade total daquele produto.

Exemplo:

Fralda RN

Ana: 2

João: 1

Pessoa anônima: 3

Total exibido:

6 unidades

Na tela pública não é necessário mostrar quem escolheu.

Mostrar somente:

"6 unidades já escolhidas"

==================================================

6. ÁREA DA MAMÃE / ADMIN

==================================================

Criar uma rota separada:

/admin

Essa área NÃO deve aparecer para os convidados na navegação normal.

Criar uma tela de login simples para proteger a área administrativa.

Depois do login mostrar:

"Chá da Maya 💕

Resumo dos presentes"

Cards no topo:

Presentes prometidos

Quantidade total de itens

Número de participantes

Depois mostrar o resumo por categoria.

Exemplo:

FRALDAS

RN          12

P           18

M           27

G           14

Adicionar uma visualização muito simples das quantidades.

Depois:

MIMOS PARA MAYA

Lenço umedecido             8

Pomada para assadura        5

Toalha com capuz            3

Body manga curta P          4

Body manga curta M          6

...

Permitir clicar em um item para ver os registros:

Fralda M

Total: 27

Ana             2

Carlos          3

Não identificado 1

...

==================================================

7. GERENCIAMENTO DA LISTA

Na área administrativa, permitir:

- adicionar novo item

- editar item

- remover item

- alterar categoria

- alterar tamanho

- ativar/desativar item

- visualizar quantidade escolhida

Assim a mamãe consegue alterar a lista depois sem precisar modificar código.

==================================================

8. BANCO DE DADOS

Usar Supabase.

Criar uma estrutura simples.

Tabela categories:

id

name

display_order

created_at

Tabela gift_items:

id

category_id

name

size

description

active

display_order

created_at

Tabela gift_commitments:

id

gift_item_id

guest_name

quantity

created_at

A quantidade mostrada para cada item deve ser calculada pela soma de:

gift_commitments.quantity

Não armazenar apenas um contador fixo no produto.

==================================================

9. EXPERIÊNCIA MOBILE

O projeto deve ser MOBILE FIRST.

Priorizar telas entre 360px e 430px.

No desktop, centralizar o conteúdo em uma área com largura máxima aproximada de 600px, mantendo a sensação de aplicativo mobile.

Botões grandes e fáceis de tocar.

Evitar tabelas na área do convidado.

Usar bottom sheets/modais amigáveis no celular.

Adicionar feedback visual depois de confirmar uma escolha.

==================================================

10. NAVEGAÇÃO

Para o convidado:

Home

↓

Lista

↓

Escolher presente

↓

Quantidade

↓

Confirmar

↓

Sucesso

↓

Continuar escolhendo

Não exigir login ou cadastro do convidado.

==================================================

11. DETALHES IMPORTANTES

Não transformar isso em uma loja.

Não usar:

- preço

- carrinho de compras

- checkout

- pagamento

A pessoa está apenas dizendo o que pretende levar para o chá.

Evitar textos como:

"Comprar"

"Adicionar ao carrinho"

"Estoque"

Usar linguagem afetiva:

"Eu vou levar"

"Escolher mimo"

"Já escolheram"

"Confirmar meu presente"

O resultado final precisa ser muito bonito visualmente, mas também extremamente simples para pessoas de qualquer idade utilizarem pelo celular.

Use as imagens anexadas apenas como REFERÊNCIA para construir a identidade visual do aplicativo, principalmente as flores, borboletas, tons de rosa e verde e o estilo delicado de aquarela.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0b73934c-5995-4c44-bdf0-c8f80b74c7f7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
