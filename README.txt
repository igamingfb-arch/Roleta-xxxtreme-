LIGHTNING AI WEB — PRIMEIRA VERSÃO

Projeto web responsivo para celular, com painel preto, vermelho e dourado.
O servidor tenta ler o histórico público do CasinoScores e expõe /api/spins.
O navegador atualiza o painel a cada 35 segundos.

PUBLICAÇÃO
Hospedagem compatível com Node.js 20+.
Comando de instalação: npm install
Comando de inicialização: npm start
O render.yaml contém uma configuração inicial para Render.

ATENÇÃO
O CasinoScores não tem uma API pública documentada confirmada. Este conector
é experimental e precisa ser testado após publicação. Se o site carregar os
dados via JavaScript, bloquear consultas automatizadas ou alterar seu HTML,
o parser precisará de ajuste. Nenhum resultado é inventado quando a leitura falha.

A página de referência é:
https://www.casino.org/casinoscores/pt-br/xxxtreme-lightning-roulette/

Histórico e estatísticas não preveem o próximo giro nem garantem ganhos.

Atualização de interface: layout Intelligence Terminal, responsivo para celular.


FUNÇÃO NOVA — RADAR DE RODADAS
O painel acompanha todo resultado com multiplicador identificado e conta os
giros seguintes até as marcas 8, 9, 10 e 11. Os alertas do navegador precisam
ser ativados pelo botão no painel. Para receber notificações, permita-as no
navegador e mantenha o site aberto. A contagem depende da ordem do histórico
fornecido pela fonte (mais recente primeiro); confirme essa ordem ao validar
a integração. A primeira leitura cria uma referência e não dispara alertas
retroativos. Se a página não fornecer multiplicadores ou giros completos,
a contagem pode ficar incompleta.

AJUSTE: resultados com multiplicador exatamente 2x foram removidos da tabela visível e não geram alertas no Radar de Rodadas. Eles continuam contando como giros na sequência, para que as posições 8ª a 11ª permaneçam corretas.
