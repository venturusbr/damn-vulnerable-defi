![](cover.png)

**Uma série de desafios para aprender segurança ofensiva de contratos inteligentes na Ethereum.**
Inclui <em>flash loans</em>, oráculos de preços, governança, NFTs, <em>lending pools</em>, carteiras baseadas em <em>smart contracts</em>, <em>timelocks</em>, e mais!

Os desafios foram elaborados por [@tinchoabbate](https://twitter.com/tinchoabbate) e postados originalmente em [damnvulnerabledefi.xyz](https://damnvulnerabledefi.xyz), todos os direitos pertencem ao criador.
As soluções apresentadas foram elaboradas por [@izcoser](https://github.com/izcoser), desenvolvedor blockchain [Venturus](https://venturus.org.br).

## Como jogar

Na branch ```main```:

1. Clone este repositório.
2. Instale as dependências: ```yarn install```.
3. Programe sua solução no teste de cada desafio. Você deve ser, exclusivamente, a conta ```player```.
4. Para verificar se sua solução passou: ```yarn run hardhat test <arquivo de teste>```.

Nota:  em alguns desafios, será necessário programar seus próprios contratos de ataque.  

## Problemas e Soluções

Para ver as soluções e explicações, troque para a branch ```solutions```.

### Desafio #1 - Unstoppable

Há um cofre tokenizado com um milhão de tokens DVT. O cofre oferece <em>flash loans</em> de graça, até que o período carência termine.
Para passar no desafio, faça com que o cofre pare de oferecer <em>flash loans</em>.
Você começa com 10 tokens DVT em saldo.

[Veja os contratos](contracts/unstoppable)

[Resolva o desafio](test/unstoppable/unstoppable.challenge.js)

### Desafio #2 - Naive receiver

Existe uma <em>pool</em> com 1000 ETH em saldo, oferecendo <em>flash loans</em>. Elas tem uma taxa fixa de 1 ETH.
Um usuário criou um contrato com 10 ETH em saldo. Ele é capaz de interagir com a <em>pool</em> e receber <em>flash loans</em> em ETH.
Tome todo o ETH do contrato do usuário, se possível em uma única transação.

[Veja os contratos](contracts/naive-receiver)

[Resolva o desafio](test/naive-receiver/naive-receiver.challenge.js)

### Desafio #3 - Truster
Mais e mais <em>lending pools</em> estão oferecendo <em>flash loans</em>. Nesse caso, uma nova <em>pool</em> está oferecendo <em>flash loans</em> de tokens DVT de graça.

A <em>pool</em> possui 1 milhão de tokens DVT. Você não possui nada.
Para passar neste desafio, tome todos os tokens da <em>pool</em>. Se possível em uma única transação.

[Veja os contratos](contracts/truster)

[Resolva o desafio](test/truster/truster.challenge.js)

### Desafio #4 - Side Entrance

Uma <em>pool</em> surpreendentemente simples permite que qualquer pessoa deposite ETH e o resgate a qualquer momento.
Ela possui 1000 ETH em saldo e está oferecendo <em>flash loans</em> usando o ETH depositado para promover seu sistema.
Iniciando com 1 ETH em saldo, passe o desafio tomando todo o ETH da <em>pool</em>.

[Veja os contratos](contracts/side-entrance)

[Resolva o desafio](test/side-entrance/side-entrance.challenge.js)

### Desafio #5 - The Rewarder

Existe uma <em>pool</em> oferecendo benefícios em tokens a cada 5 dias para aqueles que depositam DVT nela.

Alice, Bob, Charlie e David já depositaram alguns DVTs e ganharam seus benefícios.

Você não possui nem um DVT. Mas no próximo <em>round</em>, você deve resgatar todos os benefícios para si mesmo.

Por falar nisso, há rumores que uma nova <em>pool</em> foi lançada e ela está oferecendo <em>flash loans</em> de DVT.

[Veja os contratos](contracts/the-rewarder)

[Resolva o desafio](test/the-rewarder/the-rewarder.challenge.js)

### Desafio #6 - Selfie

Uma nova <em>lending pool</em> foi lançada. Ela está oferecendo <em>flash loans</em> de tokens DVT. Inclui até um elaborado mecanismo de governança para controlá-la.

O que poderia dar errado, né?

Você começa com 0 tokens DVT e a <em>pool</em> possui 1.5 milhões de tokens. Seu objetivo é obter todos eles.

[Veja os contratos](contracts/selfie)

[Resolva o desafio](test/selfie/selfie.challenge.js)

### Desafio #7 - Compromised

Investigando o <em>web service</em> de um dos mais populares projetos DeFi do ecossistema, você encontra uma resposta estranha do seu servidor:

```
HTTP/2 200 OK
content-type: text/html
content-language: en
vary: Accept-Encoding
server: cloudflare

4d 48 68 6a 4e 6a 63 34 5a 57 59 78 59 57 45 30 4e 54 5a 6b 59 54 59 31 59 7a 5a 6d 59 7a 55 34 4e 6a 46 6b 4e 44 51 34 4f 54 4a 6a 5a 47 5a 68 59 7a 42 6a 4e 6d 4d 34 59 7a 49 31 4e 6a 42 69 5a 6a 42 6a 4f 57 5a 69 59 32 52 68 5a 54 4a 6d 4e 44 63 7a 4e 57 45 35

4d 48 67 79 4d 44 67 79 4e 44 4a 6a 4e 44 42 68 59 32 52 6d 59 54 6c 6c 5a 44 67 34 4f 57 55 32 4f 44 56 6a 4d 6a 4d 31 4e 44 64 68 59 32 4a 6c 5a 44 6c 69 5a 57 5a 6a 4e 6a 41 7a 4e 7a 46 6c 4f 54 67 33 4e 57 5a 69 59 32 51 33 4d 7a 59 7a 4e 44 42 69 59 6a 51 34
```

Uma corretora <em>on-chain</em>, relacionada a este projeto, está vendendo colecionáveis (absurdamente caros) chamados "DVNFT", a um preço de 999 ETH cada.

O preço é obtido a partir de um oráculo <em>on-chain</em>, baseado em 3 reportadores confiáveis:
0xA732...A105,0xe924...9D15 and 0x81A5...850c.

Iniciando com somente 0.1 ETH, passe o desafio obtendo todo o ETH disponível na corretora.

[Veja os contratos](contracts/compromised)

[Resolva o desafio](test/compromised/compromised.challenge.js)

### Desafio #8 - Puppet

Existe uma <em>lending pool</em> onde usuários podem pegar empréstimos de Damn Valuable Tokens (DVTs). Para isso, eles precisam, antes, depositar o dobro do valor em ETH como colateral. A <em>pool</em> atualmente possui 100000 DVTs em liquidez.

Existe um mercado de DVT aberto em uma antiga [corretora Uniswap V1](https://docs.uniswap.org/contracts/v1/overview), atualmente com 10 ETH e 10 DVT em liquidez.

Passe o desafio obtendo todos os tokens da <em>lending pool</em>. Você começa com 25 ETH e 1000 DVTs em saldo.

[Veja os contratos](contracts/puppet)

[Resolva o desafio](test/puppet/puppet.challenge.js)


### Desafio #9 - Puppet V2

Os desenvolvedores a <em>pool</em> anterior parecem ter aprendido com o erro. E lançaram uma nova versão. 
Agora eles estão usando a [corretora Uniswap V2](https://docs.uniswap.org/contracts/v2/overview) como oráculo, assim como as bibliotecas de utilidade recomendadas. Isso deve ser o suficiente.

Você começa com 20 ETH e 10000 DVT em saldo. A <em>pool</em> possui um milhão de DVT em saldo. Você sabe o que fazer.

[Veja os contratos](contracts/puppet-v2)

[Resolva o desafio](test/puppet-v2/puppet-v2.challenge.js)

### Desafio #10 - Free Rider

Um novo <em>marketplace</em> de Damn Valuable NFTs foi lançado. Ocorreu um <em>mint</em> inicial de 6 NFTs, as quais estão disponíveis para venda no <em>marketplace</em>. Cada uma custa 15 ETH.

Os desenvolvedores foram alertados de que o <em>marketplace</em> está vulnerável. Todos os tokens podem ser tomados. No entanto, eles não fazem ideia de como fazê-lo. Então, eles estão oferecendo uma recompensa de 45 ETH para qualquer um que consiga retirar as NFTs e mandá-las para eles.

Você concordou em ajudar. Porém, você só possui 0.1 ETH em saldo. Os desenvolvedores não respondem às suas mensagens. 

Se apenas você pudesse conseguir um pouco de ETH de graça, pelo menos por um instante.

[Veja os contratos](contracts/free-rider)

[Resolva o desafio](test/free-rider/free-rider.challenge.js)


### Desafio #11 - Backdoor

Para incentivar a criação de carteiras mais seguras no time, alguém criou um cartório de [carteiras Gnosis Safe](https://github.com/gnosis/safe-contracts/blob/v1.3.0/contracts/GnosisSafe.sol). Quando alguém no time cria uma carteira e a registra no cartório, ela ganha 10 DVTs.

Para garantir que tudo está seguro, o cartório integra-se firmemente com o legítimo  [Gnosis Safe Proxy Factory](https://github.com/gnosis/safe-contracts/blob/v1.3.0/contracts/proxies/GnosisSafeProxyFactory.sol), e possui checagens adicionais de segurança.

Atualmente, existem 4 pessoas registradas como beneficiários. Alice, Bob, Charlie e David. O cartório possui 40 DVTs em saldo para distribuir entre eles.

Seu objetivo é obter todos os fundos do cartório. Em uma única transação.

Veja os contratos
Complete o desafio
Resolva o desafio

[Veja os contratos](contracts/backdoor)

[Resolva o desafio](test/backdoor/backdoor.challenge.js)

### Desafio #12 - Climber

Existe um contrato de cofre seguro guardando 10 milhões de tokens DVT. O cofre é <em>upgradeable</em>, seguindo o [UUPS pattern](https://eips.ethereum.org/EIPS/eip-1822).

O dono do cofre, atualmente um <em>timelock contract</em>, pode resgatar uma quantidade limitada de tokens a cada 15 dias. 

No cofre, existe um [papel](https://docs.openzeppelin.com/contracts/2.x/access-control) adicional com poderes para resgatar todos os tokens em caso de emergência.

No <em>timelock</em>, somente a conta com o papel "Proposer" pode agendar ações, as quais podem ser executadas uma hora após o agendamento.

Para passar esse desafio, obtenha todos os tokens do cofre.

[Veja os contratos](contracts/climber)

[Resolva o desafio](test/climber/climber.challenge.js)


### Desafio #13 - Wallet Mining

Existe um contrato que incentiva usuários a criarem carteiras Gnosis Safe, recompensando-os com 1 DVT. Ele integra com um mecanismo <em>upgradeable</em> de autorização. Isso garante que somente <em>deployers</em> permitidos (a.k.a wards) são pagos por <em>deployments</em> específicos. Lembre-se, partes desse sistema foram altamente otimizadas por gurus do Crypto Twitter.

O <em>deployer contract</em> funciona somente com a Gnosis Safe factory oficial no endereço 0x76E2cFc1F5Fa8F6a5b3fC4c8F4788F0116861F9B e a master copy correspondente no endereço 0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F. Não sei como deve funcionar, afinal estes contratos ainda nem foram criados nesta rede.

Enquanto isso, parece que alguém já transferiu 20 milhões de tokens DVT para 0x9b6fb606a9f5789444c17768c6dfcf2f83563801. Esse endereço foi atribuído como um <em>ward</em> no contrato de autorização. O que é estranho, pois esse endereço também está vazio.

Passe o desafio obtendo todos os tokens controlados pelo contrato <em>wallet deployer</em>. Ah, e os 20 milhões de DVT também.

[Veja os contratos](contracts/wallet-mining)

[Resolva o desafio](test/wallet-mining/wallet-mining.challenge.js)

### Desafio 14 - Puppet V3

Mesmo em um <em>bear market</em>, os desenvolvedores da Puppet continuam construindo.

Na última versão, eles estão usando a Uniswap V3 como um oráculo. Isso mesmo, não usam mais preços <em>spot</em>. Dessa vez, a <em>pool</em> verifica o preço do ativo usando uma média ponderada ao longo do tempo, usando as bibliotecas recomendadas.

A corretora Uniswap possui 100 WETH e 100 DVT em liquidez. A <em>lending pool</em> tem um milhão de tokens DVT.

Iniciando com 1 ETH e alguns DVT, passe esse desafio tomando todos os tokens da lending pool.

NOTA: ao contrário dos outros, este desafio requer conexão a uma URL de RPC válida no arquivo de teste do desafio para realizar um <em>fork</em> do estado da <em>mainnet</em> no ambiente local.

[Veja os contratos](contracts/puppet-v3)

[Resolva o desafio](test/puppet-v3/puppet-v3.challenge.js)


### Desafio 15 - ABI Smuggling

Existe um cofre permissionado com um milhão de tokens DVT. O cofre permite resgate de fundos periodicamente, assim como o resgate de todos os fundos em caso de emergência.

O contrato possui um esquema de autorização integrado, permitindo somente que contas conhecidas executem ações específicas. 

O time de desenvolvimento recebeu um alerta de que todos os fundos podem ser roubados.

Antes que seja tarde, resgate os fundos do cofre e transfira para a conta de recuperação.

[Veja os contratos](contracts/abi-smuggling)

[Resolva o desafio](test/abi-smuggling/abi-smuggling.challenge.js)

## Disclaimer

Todo o código Solidity, práticas e <em>patterns</em> neste repositório estão vulneráveis e são somente para propósitos educacionais.
Não use em produção.