Atue como um Desenvolvedor Front-end Sênior especialista em Next.js e React.

Preciso que você integre a minha rota de API de chat em um componente de interface de chat existente (ou crie a estrutura do componente caso necessário).

### Requisitos Técnicos e Funcionais:

1. **Consumo da Rota de Chat:**
   - Crie/atualize a função de envio de mensagens para fazer uma requisição (`fetch` ou `axios`) para a minha rota de API (ex: `/api/chat`).
   - O corpo da requisição deve enviar o texto digitado pelo usuário.
   - Ao receber a resposta da API, adicione a resposta da IA/sistema ao histórico de mensagens do chat.

2. **Gerenciamento de Estado de Loading (UX):**
   - Adicione um estado de carregamento (`isLoading` / `isPending`).
   - Assim que o usuário clicar em enviar (ou pressionar Enter), defina `isLoading = true`.
   - Enquanto `isLoading` for `true`:
     - Exiba um indicador visual de carregamento na interface (ex: um indicador de digitação "typing indicator" com 3 pontinhos animados ou um spinner discreto no final da lista de mensagens).
     - Desabilite o campo de input e o botão de envio para evitar múltiplos disparos acidentais.
   - Assim que a resposta chegar (ou der erro), defina `isLoading = false` e reative o input e o botão.

3. **Boas Práticas & Tratamento de Erros:**
   - Utilize o hook `useState` (ou a biblioteca de estado/mutações adequada, como React Query/SWR se já estiver configurada no projeto) para gerenciar `messages`, `input` e `isLoading`.
   - Adicione um bloco `try/catch/finally` na chamada da API:
     - No `catch`, trate erros exibindo uma mensagem amigável no chat ou um toast, e garantindo que o estado de loading seja finalizado no `finally`.
   - Garanta que após o envio bem-sucedido, o input de texto seja limpo e receba foco novamente (`inputRef.current?.focus()`).
   - Adicione um auto-scroll automático para o final da lista de mensagens sempre que uma nova mensagem for adicionada ou o loading for ativado (`scrollIntoView`).

Por favor, forneça o código limpo, bem tipado em TypeScript, seguindo as melhores práticas do Next.js (App Router ou Pages Router).