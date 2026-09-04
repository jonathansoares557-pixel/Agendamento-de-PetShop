# Agendamento de PetShop — Mundo Pet

Implementação em HTML, CSS e JavaScript puro do layout Figma **"Agendamento de petshop"**
(https://www.figma.com/design/YTNxuYCSykfD5UnGgcJqpe/Agendamento-de-petshop--Community-).

## Estrutura

```
Agendamento de PetShop/
├── index.html        # Estrutura da página (agenda + modal de novo agendamento)
├── css/
│   └── style.css      # Estilos, incluindo os tokens de cor/tipografia do Style Guide
├── js/
│   └── script.js       # Toda a lógica: listar, filtrar por data, criar e remover agendamentos
└── README.md
```

## Funcionalidades implementadas

- Listagem de agendamentos do dia agrupados por período (**Manhã**, **Tarde**, **Noite**),
  calculados automaticamente a partir do horário.
- **Seletor de data**: troca a data exibida e filtra os agendamentos daquele dia
  (mostra "Nenhum agendamento para esta data." quando vazio).
- **Novo agendamento**: botão flutuante abre um modal (igual ao protótipo do Figma) com
  validação dos campos, máscara de telefone brasileira e criação do item na lista correta.
- **Remover agendamento**: remove instantaneamente e oferece "Desfazer" por 5 segundos.
- **Persistência**: os agendamentos ficam salvos em `localStorage`, então continuam lá
  após recarregar a página.
- Layout **responsivo** (o modal e a lista se adaptam para telas de celular, como no
  terceiro frame do Figma).

## Como rodar

Basta abrir `index.html` num servidor local (não precisa de build). Duas opções simples:

```bash
# Opção 1: Python
python -m http.server 5173

# Opção 2: Node (npx)
npx serve .
```

Depois acesse `http://localhost:5173`.

## Paleta de cores (extraída do Style Guide do Figma)

| Token | Valor |
|---|---|
| content-primary | `#FFFFFF` |
| content-secondary | `#98959D` |
| content-brand | `#9282FA` |
| background-primary | `#151515` |
| background-secondary | `#1E1E1E` |
| background-tertiary | `#23242C` |
| background-brand | `#9282FA` |
| border-primary | `#3E3C41` |
| accent-blue | `#027DF0` |
| accent-yellow | `#F0DC02` |
| accent-orange | `#F09102` |

Tipografia: **Inter Tight** (títulos, 700) e **Inter** (corpo, 400–700), carregadas via Google Fonts.
