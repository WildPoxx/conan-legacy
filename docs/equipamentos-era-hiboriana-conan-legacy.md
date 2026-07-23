# Catalogo de equipamentos da Era Hiboriana - Conan Legacy

Documento de bancada para o Mestre. Este catalogo consolida uma lista inicial autoral de equipamentos para Conan Legacy em SWADE, inspirada no Core de SWADE, no guia local de criacao, no prototipo ja aprovado da espada curta e em materiais de Conan lidos apenas como referencia de tom e estrutura. Ele nao altera o gerador HTML.

**Estado editorial:** arquitetura aprovada para playtest. Armas, armaduras, escudos, substancias perigosas, talismas e itens de alto impacto permanecem provisórios ate auditoria por familia ou item.

## 1. Principios

- Cada PC comeca com **650 moedas** para comprar equipamento.
- O catalogo usa **Familia + Qualidade + Cultura/Procedencia**.
- Familia define o chassi: dano, protecao, Parry, alcance, maos, peso e propriedades.
- Qualidade altera apenas campos declarados.
- Cultura/procedencia informa acesso, aparencia, tradicao, tabu, prestigio ou gancho narrativo.
- Historia pessoal pode justificar excecao de acesso, desconto ou disponibilidade, mas isso e decisao do Mestre, nao regra automatica.
- Peso deve ser registrado e pode gerar alerta, mas nao deve travar automaticamente a criacao nesta versao.
- Escudo nao desativa **Unarmored Hero**. Armadura corporal desativa.
- Capacete e protecao situacional: nao soma Toughness automaticamente.
- Itens de Acheron, Kuth, Atlantis, materiais atlantes e lotus maior pertencem ao catalogo do Mestre.

## 2. Acesso e raridade

| Acesso | Uso |
|---|---|
| Publico | Pode ser comprado por PCs na criacao, se houver mercado plausivel. |
| Incomum | Exige cidade, caravaneiro, artifice, arsenal ou contato adequado. |
| Raro | So aparece em mercado especifico, porto grande, templo, alquimista, nobreza ou submundo. |
| Restrito | Precisa aprovacao do Mestre; posse pode gerar consequencia social, legal ou criminal. |
| Singular | Nao e compra comum; entra por historia, vinculo, Background, faccao ou aventura. |
| Mestre | Nao disponivel para compra inicial; usado como recompensa, misterio, ameaca ou artefato. |

## 3. Qualidades e materiais

| Qualidade | Aplica-se a | Uso mecanico |
|---|---|---|
| `common_hyborian` | armas e armaduras comuns | Material local, bronze, ferro irregular, couro bruto ou manufatura antiga. Pode ter peso ou penalidade, conforme familia auditada. |
| `swade_standard_metalwork` | armas e armaduras de boa metalurgia | Equivalente ao perfil SWADE medieval normal; caro e Incomum/Raro conforme item. |
| `inferior` | armas, ferramentas e armaduras pobres | Improvisado, gasto, osso, pedra, bronze ruim ou saque deteriorado. So altera campo declarado. |
| `exceptional_steel` | encomendas e Feituras | Sem bonus generico ate auditoria propria. Restrito/Singular. |
| `atlantean_fragment` | artefatos menores | AP 1 se arma; leveza ou resistencia limitada; Mestre. |
| `atlantean_integral` | artefatos importantes | AP 2 se arma; reduz Forca Minima em 1 passo ou remove penalidade narrativa de peso; Mestre. |
| `atlantean_primordial` | reliquias centrais | AP 3 se arma; apenas para item nomeado de campanha; Mestre. |

Arma atlante nao concede bonus de ataque, dano, Parry, Soak ou Toughness. A resistencia protege a arma, nao o usuario.

## 4. Armas iniciais

Somente a espada curta possui perfil hiboriano auditado para playtest. As demais familias conservam o perfil SWADE de referencia ate sua propria rodada Criativo-Editorial.

| ID | Item | Perfil | For. Min. | AP | Custo | Peso | Acesso | Estado |
|---|---|---:|---:|---:|---:|---:|---|---|
| WPN-01 | Faca ou adaga | `For+d4`; arremesso 3/6/12 | d4 | 0 | 15 | 1 | Publico | Provisorio |
| WPN-02 | Espada curta comum hiboriana | `For+d6-1` | d6 | 0 | 75 | 2 | Publico | Playtest |
| WPN-03 | Espada curta de metalurgia padrao | `For+d6` | d6 | 0 | 175 | 2 | Incomum | Playtest |
| WPN-04 | Espada longa | `For+d8` | d8 | 0 | 150 | 4 | Publico | Provisorio |
| WPN-05 | Espada grande | `For+d10`; duas maos | d10 | 0 | 300 | 8 | Restrito | Provisorio |
| WPN-06 | Machado pequeno/de mao | `For+d6`; arremesso 3/6/12 | d6 | 0 | 50 | 2 | Publico | Provisorio |
| WPN-07 | Machado grande/pesado | `For+d8`; duas maos | d8 | 0 | 125 | 5 | Incomum | Provisorio |
| WPN-08 | Martelo pequeno/maca | `For+d6` | d6 | 0 | 35 | 3 | Publico | Provisorio |
| WPN-09 | Martelo grande | `For+d8`; duas maos | d8 | 0 | 100 | 6 | Incomum | Provisorio |
| WPN-10 | Clava ou porrete | `For+d4` | d4 | 0 | 10 | 2 | Publico | Provisorio |
| WPN-11 | Lanca | `For+d6`; Alcance 1; arremesso 3/6/12 | d6 | 0 | 40 | 3 | Publico | Provisorio |
| WPN-12 | Arma de haste grande | `For+d8`; Alcance 1; duas maos | d8 | 0 | 175 | 6 | Incomum | Provisorio |
| WPN-13 | Arco curto | `2d6`; alcance 12/24/48 | - | 0 | 100 | 2 | Publico | Provisorio |
| WPN-14 | Arco longo/de guerra | `2d6`; alcance 15/30/60 | - | 0 | 175 | 3 | Incomum | Provisorio |
| WPN-15 | Arco hyrkaniano | `2d6`; alcance longo, montaria | - | 0 | 250 | 3 | Restrito | Provisorio |
| WPN-16 | Funda | `For+d4`; alcance 4/8/16 | d4 | 0 | 10 | 1 | Publico | Provisorio |
| WPN-17 | Flechas, lote de 20 | municao | - | - | 10 | 1 | Publico | Provisorio |
| WPN-18 | Pedras de funda, bolsa | municao | - | - | 2 | 2 | Publico | Provisorio |

A besta existe no cenario, mas fica fora do baseline inicial. Trate-a como tecnologia avancada, rara e dependente de auditoria futura.

## 5. Escudos e protecao situacional

| ID | Item | Efeito | Custo | Peso | Acesso | Estado |
|---|---|---|---:|---:|---|---|
| SHD-01 | Escudo pequeno | +1 Parry; facil de transportar | 40 | 2 | Publico | Provisorio |
| SHD-02 | Escudo grande | +2 Parry; volumoso em espaco estreito | 90 | 4 | Incomum | Provisorio |
| SHD-03 | Escudo reforcado | Perfil do escudo base; melhor resistencia narrativa | +50 | +1 | Incomum | Provisorio |
| SHD-04 | Escudo atlante | Artefato leve e resistente; nao compra inicial | - | - | Mestre | Artefato |
| HELM-01 | Capacete simples | Protecao situacional contra golpes na cabeca | 35 | 2 | Publico | Provisorio |
| HELM-02 | Capacete militar | Protecao situacional; aparencia marcial evidente | 75 | 3 | Incomum | Provisorio |

Capacetes nao devem ser somados automaticamente ao Toughness. Use-os quando a ficcao envolver golpe mirado na cabeca, queda, desabamento, execucao, projeteis ou protecao ritualizada.

## 6. Armaduras iniciais

Estas armaduras ainda exigem auditoria por familia. A diretriz atual e evitar reduzir protecao como regra geral; a precariedade hiboriana deve aparecer principalmente em peso, calor, ruido, manutencao ou Forca Minima.

| ID | Item | Armor | Custo | Peso | Acesso | Observacao |
|---|---:|---:|---:|---:|---|---|
| ARM-01 | Acolchoado/gambesao | +1 | 60 | 6 | Publico | Quente, simples, comum. |
| ARM-02 | Couro endurecido | +1 | 100 | 5 | Publico | Boa protecao leve; comum em fronteiras. |
| ARM-03 | Couro e escamas | +2 | 225 | 10 | Incomum | Militar ou mercenario; ruidosa se mal feita. |
| ARM-04 | Cota de malha | +2 | 350 | 15 | Incomum | Metalurgia padrao SWADE; cara e pesada. |
| ARM-05 | Peitoral metalico | +2 | 300 | 10 | Incomum | Protege bem tronco; cobertura parcial na ficcao. |
| ARM-06 | Armadura pesada de guerra | +3 | 600 | 20 | Restrito | Exige conceito, Forca e aprovacao. |
| ARM-07 | Barding leve para montaria | +1 | 250 | - | Restrito | Para cavalo de guerra; reduz discricao. |

## 7. Equipamento comum de aventura, trilha e acampamento

| ID | Item | Custo | Peso | Acesso | Uso |
|---|---|---:|---:|---|---|
| ADV-01 | Mochila de couro cru | 12 | 2 | Publico | Carregar equipamento. |
| ADV-02 | Saco de viagem encerado | 8 | 1 | Publico | Protege roupa, comida ou pergaminhos. |
| ADV-03 | Odre ou cantil | 3 | 1 | Publico | Agua de viagem. |
| ADV-04 | Racoes secas, 7 dias | 14 | 3 | Publico | Alimento seco de viagem. |
| ADV-05 | Manta grossa | 10 | 3 | Publico | Frio, sono, camuflagem improvisada. |
| ADV-06 | Capa de viagem | 15 | 2 | Publico | Chuva, poeira, disfarce comum. |
| ADV-07 | Tenda pequena | 25 | 5 | Publico | Abrigo de 1 pessoa; 2 apertadas. |
| ADV-08 | Lona encerada | 12 | 3 | Publico | Abrigo, cobertura de carga, maca improvisada. |
| ADV-09 | Corda de canhamo, 15 m | 20 | 2 | Publico | Escalada, amarracao, resgate. |
| ADV-10 | Gancho de escalada | 25 | 2 | Publico | Complementa corda; barulhento. |
| ADV-11 | Pederneira e aco | 3 | 1 | Publico | Acender fogo em condicoes normais. |
| ADV-12 | Tochas, lote de 6 | 6 | 2 | Publico | Luz barata, fumaca, chama ostensiva. |
| ADV-13 | Vela de sebo, lote de 6 | 3 | 1 | Publico | Luz discreta e pobre. |
| ADV-14 | Lamparina | 18 | 2 | Publico | Luz estavel; exige oleo. |
| ADV-15 | Oleo comum, frasco | 2 | 1 | Publico | Luz e manutencao; nao e granada sem regra propria. |
| ADV-16 | Panela pequena | 8 | 2 | Publico | Cozinha, fervura, improvisos. |
| ADV-17 | Kit de pesca | 12 | 1 | Publico | Support em Survival perto de agua. |
| ADV-18 | Armadilhas pequenas de caca | 20 | 3 | Publico | Caca menor; exige tempo. |
| ADV-19 | Pedra de amolar | 5 | 1 | Publico | Manutencao; sem bonus de dano. |
| ADV-20 | Agulha, linha e remendos | 5 | 1 | Publico | Reparos simples. |
| ADV-21 | Kit de reparos de campo | 25 | 2 | Publico | Couro, bainhas, arreios, correias. |
| ADV-22 | Martelo e cravos | 15 | 3 | Publico | Acampamento, escalada lenta, portas. |
| ADV-23 | Pe de cabra | 20 | 3 | Publico | Arrombamento bruto; barulhento. |
| ADV-24 | Pa curta | 10 | 4 | Publico | Cavar, enterrar, apagar fogo. |
| ADV-25 | Machado de acampamento | 20 | 3 | Publico | Ferramenta; como arma, use familia inferior. |
| ADV-26 | Giz, carvao ou pigmento | 2 | 1 | Publico | Marcas de trilha, mapas, sinais. |
| ADV-27 | Frasco vazio | 2 | 1 | Publico | Coletar agua, oleo, cinzas ou reagentes. |
| ADV-28 | Corrente curta | 20 | 4 | Publico | Prender carga, animal ou prisioneiro. |
| ADV-29 | Cadeado simples | 25 | 1 | Publico | Protecao mundana. |
| ADV-30 | Apito de osso ou bronze | 5 | 0 | Publico | Sinalizacao curta. |

## 8. Ferramentas profissionais e kits

Kits habilitam tarefas ou removem uma penalidade narrativa por falta de equipamento. Eles nao dao bonus automatico permanente.

| ID | Item | Custo | Peso | Acesso | Uso |
|---|---|---:|---:|---|---|
| KIT-01 | Kit de cura | 40 | 2 | Publico | Ataduras, ervas comuns e agulhas. |
| KIT-02 | Bolsa de curandeiro boa | 100 | 3 | Incomum | Permite tratamento mais limpo; recargas custam 25. |
| KIT-03 | Kit de escalada | 60 | 5 | Incomum | Corda reforcada, pitoes, gancho e luvas. |
| KIT-04 | Ferramentas de ladrao | 100 | 2 | Restrito | Fechaduras, armadilhas simples e entrada discreta. |
| KIT-05 | Kit de disfarce | 50 | 2 | Incomum | Pigmentos, perucas, tecidos e detalhes sociais. |
| KIT-06 | Kit de alquimia de campo | 100 | 4 | Restrito | Frascos, almofariz, balanca e reagentes basicos. |
| KIT-07 | Ferramentas de artifice | 50 | 5 | Publico | Um oficio: ferreiro, curtidor, carpinteiro, joalheiro etc. |
| KIT-08 | Kit de escrita | 20 | 1 | Incomum | Tinta, pena, folhas, lacre simples. |
| KIT-09 | Kit de mapas | 35 | 1 | Incomum | Tabuletas, fio, carvao, cera, marcadores. |
| KIT-10 | Roupa de camuflagem regional | 40 | 2 | Incomum | Remove suspeita visual ou ajuda Stealth quando adequada. |
| KIT-11 | Biblioteca pessoal portatil | 150 | 5 | Raro | Pergaminhos e notas; assunto declarado. |
| KIT-12 | Garb de feiticeiro | 200 | 5 | Restrito | Traje, amuletos, mascaras, talismas e sinais de oficio oculto. |

Bibliotecas academicas, laboratorios completos, oficinas fixas e circulos de poder nao entram na compra inicial comum; trate como Singular ou Mestre.

## 9. Itens pessoais, sociais e urbanos

| ID | Item | Custo | Peso | Acesso | Uso |
|---|---|---:|---:|---|---|
| PER-01 | Roupas simples | 15 | 3 | Publico | Tunica, calcas ou saia, cinto e sandalias/botas. |
| PER-02 | Roupas boas | 60 | 3 | Incomum | Corte, templo, negociacao ou festa urbana. |
| PER-03 | Roupas nobres | 150 | 4 | Raro | Status evidente; chama atencao e ladroes. |
| PER-04 | Botas resistentes | 20 | 2 | Publico | Marcha, lama, pedra, cidade. |
| PER-05 | Manto de viagem | 15 | 2 | Publico | Frio, poeira, ocultar rosto. |
| PER-06 | Bolsa de moedas | 5 | 1 | Publico | Dinheiro e miudezas. |
| PER-07 | Bolsa de fundo falso | 35 | 1 | Restrito | Esconder dose, gema, mensagem ou chave. |
| PER-08 | Espelho pequeno de bronze | 20 | 1 | Incomum | Aparencia, sinais, truques de luz. |
| PER-09 | Navalha e pente | 5 | 1 | Publico | Aparencia, disfarce menor, higiene. |
| PER-10 | Perfume comum | 15 | 1 | Incomum | Status, seducao, mascarar cheiro. |
| PER-11 | Perfume de lotus diluido | 75 | 1 | Restrito | Luxo suspeito; nao tem efeito narcotico automatico. |
| PER-12 | Dados de osso | 5 | 0 | Publico | Jogo e apostas. |
| PER-13 | Dados de osso marcados | 35 | 0 | Restrito | Trapaça; risco social se descoberto. |
| PER-14 | Mascara de festival | 20 | 1 | Incomum | Disfarce social, carnaval, roubo. |
| PER-15 | Tabuleta de cera dobravel | 15 | 1 | Incomum | Notas, cifras, mapas rapidos. |
| PER-16 | Livro de contas pequeno | 25 | 1 | Incomum | Dividas, pistas, prova documental. |

## 10. Itens hiborianos de flavor

Estes itens nao concedem bonus automatico. Eles tornam a cultura visivel, justificam acesso, criam suspeita ou alimentam Interludes, Support e cenas sociais.

| ID | Item | Custo | Acesso | Procedencia | Uso |
|---|---|---:|---|---|---|
| FLV-01 | Broche de cla cimerio | 10 | Publico | Cimmeria | Juramento, rixa, hospitalidade tribal. |
| FLV-02 | Tinta de guerra picta | 15 | Incomum | Pictish Wilderness | Ritual de caca, intimidacao, disfarce perigoso. |
| FLV-03 | Veu shemita bordado | 25 | Incomum | Shem | Status, luto, negociacao. |
| FLV-04 | Lenco de poeira zuagir | 12 | Publico | Desertos shemitas | Travessia, bando, ocultar rosto. |
| FLV-05 | Selo de cera aquilonio | 20 | Incomum | Aquilonia | Carta, autoridade, fraude documental. |
| FLV-06 | Anel de mercador argosseano | 60 | Raro | Argos/Zingara | Credito, caravanas, portos. |
| FLV-07 | Fivela bossoniana de fronteira | 15 | Publico | Bossonia | Servico militar, reputacao marcial. |
| FLV-08 | Contas de osso hiperboreas | 20 | Incomum | Hyperborea | Pressagio, gelo, morte, medo supersticioso. |
| FLV-09 | Amuleto barato de Mitra | 10 | Publico | Reinos hiborianos | Fe comum; sem poder automatico. |
| FLV-10 | Efígie pequena de Set | 20 | Incomum | Stygia | Protecao social em templos setitas; risco fora deles. |
| FLV-11 | Medalhao discreto de Ibis | 35 | Restrito | Stygia anti-setita | Sinal de dissidencia e perigo. |
| FLV-12 | Charme naval de conchas | 8 | Publico | Argos, Barachas, Vilayet | Identidade portuaria e supersticao. |
| FLV-13 | Fita de peregrino | 5 | Publico | Rotas religiosas | Acesso a pousos humildes; alvo de exploracao. |
| FLV-14 | Coleira de escravo falsa | 25 | Restrito | Zamora, Stygia | Disfarce sombrio; consequencia social pesada. |
| FLV-15 | Tatuagem temporaria de guilda | 40 | Restrito | Zamora/Shadizar | Acesso ao submundo; pode ser descoberta. |
| FLV-16 | Mascara de sacerdote menor | 80 | Restrito | Stygia, Koth, Shem | Representacao ritual; perigosa se fraudulenta. |
| FLV-17 | Turibulo de bronze | 50 | Incomum | Templos e cultos | Queima incenso; sinal de rito, purificacao ou encenacao. |
| FLV-18 | Incenso comum de templo | 10 | Publico | Templos urbanos | Cheiro, cerimonia, cobertura de odores. |
| FLV-19 | Incenso raro de lotus/ambar | 75 | Restrito | Khitai, Stygia, rotas de luxo | Flavor ritual; sem efeito magico automatico. |
| FLV-20 | Pouch de ervas contra mau-olhado | 12 | Publico | Mercados e aldeias | Conforto supersticioso; pode ajudar socialmente com crentes. |
| FLV-21 | Dente de fera em cordao | 15 | Publico | Fronteiras, selvas, tribos | Trofeu, bravura, historia pessoal. |
| FLV-22 | Fragmento de pedra negra antigo | - | Mestre | Acheron, Torre, ruinas | Gancho perigoso; nao compra inicial. |

## 11. Talismas, amuletos e objetos supersticiosos

Talismas publicos sao objetos culturais, religiosos ou psicologicos. Eles nao bloqueiam magia, nao cancelam Fear, nao dao rerrolagem e nao concedem bonus automatico.

| ID | Item | Custo | Acesso | Uso seguro |
|---|---|---:|---|---|
| TAL-01 | Amuleto de Mitra | 10 | Publico | Identidade religiosa e conforto social. |
| TAL-02 | Simbolo de Set | 20 | Incomum | Marca devocao ou obediencia em contexto stigio. |
| TAL-03 | Charme de Ishtar | 15 | Publico | Amor, fertilidade, mercado, templo. |
| TAL-04 | Fetiche de caca | 15 | Publico | Interlude, trofeu, pacto tribal, Survival narrativo. |
| TAL-05 | Olho pintado contra inveja | 10 | Publico | Sinal supersticioso em porta, tenda ou pele. |
| TAL-06 | Saquinho de ervas de protecao | 12 | Publico | Cheiro, rito, conforto; sem poder automatico. |
| TAL-07 | Talisma consagrado por sacerdote | 75 | Restrito | Pode justificar Support social/religioso; nao substitui Poderes. |
| TAL-08 | Amuleto anti-veneno | 100 | Restrito | Recipiente de antidoto especifico ou sinal de treinamento; sem imunidade. |
| TAL-09 | Talisma acheroniano | - | Mestre | Atrai cobica, sonhos e risco; artefato narrativo. |
| TAL-10 | Fragmento atlante | - | Mestre | Sinal de descoberta; se tiver regra, usar artefato proprio. |

## 12. Medicamentos, drogas, venenos e lotus

Todas as substancias deste bloco sao provisórias e sujeitas a playtest. Use o bloco fixo: veiculo, aplicacao, resistencia, inicio, efeito, duracao, tratamento, Falha Critica e acesso.

| ID | Familia | Custo | Acesso | Resistencia | Efeito base |
|---|---|---:|---|---|---|
| SUB-01 | Remedio comum de dor | 20 | Publico | - | Ajuda repouso e cuidado; sem curar Ferimento sozinho. |
| SUB-02 | Tonico de curandeiro | 50 | Incomum | - | Pode justificar Support em Healing. |
| SUB-03 | Elixir asclipiano simples | 150 | Restrito | - | Estabilizacao ou nova tentativa limitada de Healing, a criterio do Mestre. |
| SUB-04 | Entorpecente leve | 50 | Restrito | Vigor | Falha: Distracted ou 1 Fatigue temporaria. |
| SUB-05 | Sonifero forte | 150 | Restrito | Vigor | Falha: sono/torpor fora de combate direto; inicio apos minutos ou cena. |
| SUB-06 | Veneno debilitante | 150 | Restrito | Vigor | Falha: Fatigue; raise do veneno pode acrescentar Vulnerable. |
| SUB-07 | Veneno letal | - | Mestre | Vigor -2 | Wound ou progressao grave; sempre com chance de tratamento. |
| SUB-08 | Alucinogeno oracular | 200 | Restrito/Singular | Spirit ou Vigor | Visao ambigua; custo em Fatigue, Distracted ou Fear. |
| SUB-09 | Estimulante de batalha | 175 | Restrito | Vigor apos uso | Adia 1 Fatigue por cena; cobra Fatigue depois. |
| SUB-10 | Antidoto especifico | 100 | Restrito | - | Ajuda contra uma familia/nome declarado; nao e cura universal. |
| SUB-11 | Po de lotus negro diluido | 250 | Raro/Restrito | Vigor | Sonifero, entorpecente ou veneno conforme preparo; Mestre define. |
| SUB-12 | Po de lotus cinzento | - | Mestre | Spirit/Vigor | Alucinacao, furia ou horror; nao compra inicial. |
| SUB-13 | Reagente alquimico instavel | 100 | Restrito | varia | Componente para ritual, Dramatic Task ou preparo; falha pode gerar Hazard. |
| SUB-14 | Liquido incendiario comum | 125 | Restrito | - | Precisa regra de cena; nao e granada confiavel barata. |
| SUB-15 | Po cegante simples | 75 | Restrito | Agility ou Vigor | Test ou situacao de Distracted; uso em combate exige acao e risco. |

Venenos em Novice devem criar tensao, oportunidade dramatica e risco. Nao devem remover chefe, PC ou cena com uma compra barata.

## 13. Servicos, contatos, montarias e transporte

| ID | Recurso | Unidade | Custo | Acesso | Observacao |
|---|---|---|---:|---|---|
| SRV-01 | Hospedagem e comida modesta | semana | 35 | Publico | Estabulo, taverna ou pouso simples. |
| SRV-02 | Hospedagem boa | semana | 100 | Incomum | Cidade, vila rica ou patrono. |
| SRV-03 | Guia local | dia | 25 | Publico | Ajuda viagem; confiabilidade e narrativa. |
| SRV-04 | Batedor de trilha | dia | 60 | Restrito | Especialista temporario; nao resolve cena sozinho. |
| SRV-05 | Guarda contratado | dia | 50 | Restrito | Extra temporario; moral e lealdade importam. |
| SRV-06 | Carregador | dia | 10 | Publico | Carga, informacao local, risco social. |
| SRV-07 | Passagem em caravana | viagem regional | 50 | Publico | Segurança relativa e rumores. |
| SRV-08 | Suborno de portao/alfandega | tentativa | 50 | Restrito | Nao garante sucesso; pode gerar chantagem. |
| SRV-09 | Acesso a esconderijo | semana ou uso | 100 | Restrito | Bairro, caverna, porao ou abrigo. |
| SRV-10 | Mensageiro confiavel | entrega regional | 40 | Incomum | Pode falhar ou ser interceptado. |
| SRV-11 | Falsificacao simples | documento | 100 | Restrito | Requer historia e risco. |
| SRV-12 | Consulta de erudito | pergunta/cena | 75 | Incomum | Nao revela segredo oculto automaticamente. |

| ID | Montaria/transporte | Custo | Acesso | Observacao |
|---|---|---:|---|---|
| MNT-01 | Mula de carga | 150 | Publico | Robusta, lenta, excelente para viagem. |
| MNT-02 | Cavalo de sela comum | 250 | Incomum | Viagem e perseguição leve. |
| MNT-03 | Cavalo de guerra | 750 | Restrito | Militar, caro, vigiado; fora do orçamento comum. |
| MNT-04 | Camelo | 250 | Incomum por regiao | Comum em desertos; caro fora deles. |
| MNT-05 | Sela e arreios | 50 | Publico | Necessario para uso regular de montaria. |
| MNT-06 | Sela elaborada | 150 | Incomum | Status e conforto; nao da bonus automatico. |
| MNT-07 | Animal de carga exotico | 300 | Restrito | Regiao e historia definem. |
| TRN-01 | Carroca pequena | 150 | Publico | Exige animal e estrada. |
| TRN-02 | Vagao coberto | 350 | Incomum | Base movel modesta; chama atencao. |
| TRN-03 | Barco de rio pequeno | 250 | Incomum | Travessia, fuga, contrabando local. |
| TRN-04 | Passagem costeira | 100 | Incomum | Depende de porto, clima, piratas e destino. |
| TRN-05 | Cota de tripulante | 0 | Restrito | Passageiro trabalha pela viagem; risco real. |

Servicos nao devem entregar combatente aliado superior aos PCs por preco trivial nem ignorar perigos de viagem, perseguicao ou politica.

## 14. Itens narrativos

Itens narrativos normalmente custam 0 e exigem origem. Se concederem efeito mecanico, devem receber ficha propria.

| ID | Item | Acesso | Origem |
|---|---|---|---|
| NAR-01 | Carta selada ou salvo-conduto | Singular | Background, faccao, Mestre. |
| NAR-02 | Mapa incompleto | Singular | Rumor, vinculo, aventura. |
| NAR-03 | Simbolo de cla, templo ou companhia | Singular | Background ou historia. |
| NAR-04 | Heranca familiar | Singular | Pode ser cosmetica ou item ja comprado. |
| NAR-05 | Prova ou documento comprometedor | Singular | Gancho de campanha. |
| NAR-06 | Divida, promessa ou contrato | Singular | Vinculo; pode ter valor negativo. |
| NAR-07 | Trofeu de caca ou guerra | Singular | Historia ou aventura. |
| NAR-08 | Fragmento ligado a Torre | Mestre | Apenas com aprovacao. |

## 15. Itens vetados para compra inicial

- Aco excepcional com bonus generico.
- Aco/material atlante.
- Artefatos acheronianos.
- Lotus maior ou preparado de efeito decisivo.
- Veneno letal compravel.
- Antidoto universal.
- Pocos/poções que reproduzam Poderes de SWADE como loja de magia.
- Talismas com bonus automatico permanente.
- Capacete que some Armor continuo.
- Armadura ou bracelete que preserve Unarmored Hero e conceda protecao constante.
- Besta, armas de cerco e tecnologia avancada sem auditoria.

## 16. Pacotes iniciais opcionais

Os pacotes aceleram criacao; o jogador pode trocar itens dentro do mesmo valor com aprovacao do Mestre.

| Pacote | Conteudo | Valor |
|---|---|---:|
| Guarda de fronteira | espada curta `common_hyborian`, escudo pequeno, gambesao, kit de viagem, racoes de 7 dias | 214 |
| Guarda de fronteira com aco | espada curta `swade_standard_metalwork`, escudo pequeno, gambesao, kit de viagem, racoes de 7 dias | 314 |
| Cacador do ermo | arco curto, 40 flechas, faca, couro endurecido, kit de viagem, tenda pequena | 285 |
| Ladrao urbano | espada curta `common_hyborian`, faca, roupas boas, ferramentas de ladrao, kit de disfarce | 300 |
| Ladrao urbano com aco | espada curta `swade_standard_metalwork`, faca, roupas boas, ferramentas de ladrao, kit de disfarce | 400 |
| Mercenario montado | espada longa, escudo pequeno, couro endurecido, cavalo, sela e arreios | 590 |
| Erudito itinerante | faca, roupas boas, kit de escrita, kit de viagem, kit de cura, reagentes de ritual | 210 |

## 17. Campos futuros do gerador

| Campo | Uso |
|---|---|
| `item_id` | Identificador estavel do item. |
| `name` | Nome exibido ao jogador. |
| `category` | Arma, armadura, ferramenta, pessoal, narrativo, substancia, servico etc. |
| `subcategory` | Trilha, acampamento, cura, veneno, talisma, transporte etc. |
| `family_id` | Familia mecanica quando existir. |
| `quality_id` | Qualidade/material. |
| `culture_id` | Procedencia cultural, quando relevante. |
| `access` | Publico, Incomum, Raro, Restrito, Singular, Mestre. |
| `availability_tags` | Cidade, fronteira, deserto, porto, submundo, templo, arsenal etc. |
| `base_cost` | Custo antes de qualidade. |
| `final_cost` | Custo final. |
| `weight` | Peso para registro e alerta. |
| `bulk_note` | Volumoso, discreto, ilegal, fragil, quente etc. |
| `is_starting_eligible` | Disponivel na criacao sem excecao. |
| `requires_master_exception` | Precisa aprovacao. |
| `personal_story_exception_note` | Justificativa de historia/profissao/vinculo. |
| `swade_trait` | Trait usado, se houver. |
| `swade_effect` | Efeito mecanico resumido, se houver. |
| `mechanical_notes` | Interacoes, limites e nao-acumulos. |
| `fictional_permissions` | O que o item permite narrativamente. |
| `source_inspiration` | SWADE, Conan d20/2d20, lore local, autoral. |
| `atlantean_tier` | nenhum, fragmentario, integro, reliquia. |
| `poison_family` | Familia de substancia, se aplicavel. |
| `editorial_status` | provisorio, playtest, aprovado, restrito, mestre. |
| `gm_notes` | Observacoes internas. |

## 18. Fontes e conversao

- SWADE Core e equipamento SWADE servem como baseline mecanico.
- `01_Characters/PCs/Guia Consolidado de Criacao e Avancos SWADE - Conan Legacy.md` confirma 650 moedas, humanos, Background Cultural, Wild Cards, 2 Avancos e Unarmored Hero.
- `docs/proposta-equipamentos-conan-legacy.md` fornece o prototipo da espada curta, pacotes e campos iniciais.
- Conan 2d20/d20 foi usado como inspiracao estrutural para disponibilidade, kits, camuflagem, bibliotecas, garb de feiticeiro, talismas, lotus, substancias perigosas, caravanas, veiculos e embarcacoes.
- Regras, CDs, Momentum, Doom, listas comerciais extensas e estatisticas de outros sistemas nao foram importados. Tudo aqui deve ser tratado como adaptacao autoral para SWADE e Conan Legacy.
