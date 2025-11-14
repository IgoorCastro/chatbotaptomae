// leitor de qr code
const qrcode = require("qrcode-terminal");
const { Client, LocalAuth  } = require("whatsapp-web.js");
const fs = require('fs');

// ======== SESSÃO ========
// Carrega session.json se existir
if (fs.existsSync('./session.json')) {
    try {
        sessionData = JSON.parse(fs.readFileSync('./session.json'));
        console.log("Sessão carregada com sucesso.");
    } catch (err) {
        console.log("Erro ao carregar a sessão:", err);
    }
}


const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  }
});

client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
client.on("ready", () => console.log("Tudo certo! WhatsApp conectado."));

client.initialize();

const delay = (ms) => new Promise((res) => setTimeout(res, ms));
const userState = {}; // Armazena o estado de cada usuário
const listaPesquisa = [];

const getCalendar = async () => {
  try {
    const resp10 = await fetch("http://localhost:1000/10Pessoas");
    const data10 = await resp10.json();

    const resp8 = await fetch("http://localhost:1000/8Pessoas");
    const data8 = await resp8.json();

    const resp7 = await fetch("http://localhost:1000/7Pessoas");
    const data7 = await resp7.json();

    return [
      {
        data: data10,
        titulo: "Apartamento para 10 pessoas",
        valor: "R$ 380"
      },
      {
        data: data8,
        titulo: "Apartamento para 8 pessoas",
        valor: "R$ 329"
      },
      {
        data: data7,
        titulo: "Apartamento para 7 pessoas",
        valor: "R$ 283"
      },
    ];
  } catch (erro) {
    console.log("Erro ao buscar dados do servidor: ", erro);
  }
};

const normalizarData = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

const dataConversor = (data) => {
  const [dia, mes, ano] = data.split("/");
  const newDate = new Date(Date.UTC(ano, mes - 1, dia, 3));
  return newDate;
}

const testeDataString = (data) => { // verifica 
  const [dia, mes, ano] = data.split("/");
  // const date_pesquisa = ;
  const date_atual = new Date();
  const normalizePesquisa = normalizarData(new Date(ano, mes - 1, dia));
  const normalizeDataAtual = normalizarData(new Date());

  if (!dia || !mes || !ano || isNaN(dia) || isNaN(mes) || isNaN(ano))
    return `⚠️Formato de data errado. Por favor, digite uma data válida para continuar.\n\nExemplo: *${date_atual.getDate()}/${date_atual.getMonth() + 1}/${date_atual.getFullYear()}*`;

  if (normalizePesquisa < normalizeDataAtual)
    return "⚠️ A data informada deve ser a partir de hoje. Por favor, escolha uma data válida para continuar.";

  const data_limite = new Date(date_atual);
  data_limite.setMonth(data_limite.getMonth() + 6);

  if(normalizePesquisa >= normalizarData(data_limite)) 
    return "⚠️ Desculpe, só conseguimos verificar datas que estejam dentro do período de até 6 meses a partir de hoje..";
  
  // data_limite.setMonth(data_limite.getMonth() + 6);
}

const dataComparador = async (date) => { // verefica a data pesquisada no calendario
  const data = await getCalendar();
  // const [dia, mes, ano] = date.split("/");
  // const tData = new Date(Date.UTC(ano, mes - 1, dia, 3));
  const tData = dataConversor(date);
  console.log("Test Data: ", tData);

  return data.map(item => { // verificar se a data ta disponivel em todos calendarios
    const test = item.data.some((date) => {      
      const sData = normalizarData(date.startDate);
      const eData = normalizarData(date.endDate);
      return tData >= sData && tData <= eData;
    })
    return { titulo: item.titulo, disponibilidade: test, valor: item.valor };
    // return test
    //   ? `${item.titulo}: ❌ Já existe uma reserva para essa data.`
    //   : `${item.titulo}: ✅ Data disponível!`;
  })
};

const menuMsg = "Você pode digitar a qualquer momento *menu* para retornar ao Menu Inicial.";

client.on("message", async (msg) => {
  const userId = msg.from;
  const menuPrincipal = async () => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname?.split(" ")[0] || "cliente";
    console.log(`\n\n-- Cliente: ${name} --`);
    await delay(1500);
    await chat.sendStateTyping();
    await client.sendMessage(
      msg.from,
      `Olá ${name}!\nSou o assistente virtual do Léo e da Valéria 🏡\n\nTrabalhamos com 3 opções de apartamentos:\n• Para até 10 pessoas\n• Para até 8 pessoas\n• Para até 7 pessoas \n\nAlguém já vai te atender, mas como posso ajudá-lo hoje?\n1 - Como funciona o assistente\n2 - Verificar reserva\n3 - Verificar disponibilidade dos apartamentos\n4 - Conheça nossos apartamentos\n5 - Esperar atendimento`
    );    
    userState[userId] = { etapa: "menu-principal" };
  }

  // MENU PRINCIPAL (/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola|bom)/i)
  if (msg.body.match(/(menu)/i) && userState[userId]?.etapa) {
    userState[userId] = {};
    menuPrincipal();
    return;
  }

  if (
    msg.body.match(/(dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola|bom|menu|gostaria|Gostaria)/i) &&
    msg.from.endsWith("@c.us") &&
    !userState[userId]?.etapa
  ) {
    menuPrincipal();
    return;
  }

  // SUBMENU COMO FUNCIONA
  if (userState[userId]?.etapa === "menu-principal") {
    if (msg.body === "1") {
      const chat = await msg.getChat();

      await delay(1500);
      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(
        msg.from,
        "Legal! 😄 Vamos entender um pouco como usar o assistente virtual!\n\nComo mencionado no *Menu Inicial*, temos três opções de apartamentos disponíveis:\n🏠 • Para até 10 pessoas\n🏠 • Para até 8 pessoas\n🏠 • Para até 7 pessoas\n\n✨ *Como utilizar o bot:*\nVocê pode digitar a qualquer momento *menu* para retornar ao Menu Inicial.\n\nNo Menu Inicial, temos 3 opções que você pode explorar:\n\n2️⃣ - *Verificar reserva*: aqui você pode consultar informações sobre uma reserva (ainda em desenvolvimento)\n\n3️⃣ - *Verificar disponibilidade*: veja a disponibilidade por uma data específica (exemplo: 12/08/2026 — siga o formato DD/MM/AAAA) ou acesse o nosso calendário completo de disponibilidade 🗓️\n\n4️⃣ - *Esperar atendimento humano*: como o próprio nome diz, logo você será atendido por alguém da nossa equipe 🤝"

      );
      return;
    }
  }

  // SUBMENU RESERVA
  if (userState[userId]?.etapa === "menu-principal") {
    if (msg.body === "2") {
      const chat = await msg.getChat();
      // userState[userId] = { etapa: "submenu-reserva" };

      await delay(1500);
      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(
        userId,
        "Por favor, responda as perguntas abaixo e logo alguem irá responder você com mais inforamções sobre sua reserva.\nQual o *nome* do titular da reserva?\nQual *plataforma* foi feita a reserva?\n\nVocê pode digitar *menu* para ver o Menu Inícial de opções novamente."
      );
      userState[userId].etapa = "submenu-reserva";
      return;
    }
  }

  if(userState[userId]?.etapa === "submenu-reserva") {
    const chat = await msg.getChat();
    userState[userId].check_rsv_titular = msg.body; // checar reserva - titular

    await delay(1500);
    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(
      userId,
      "Qual *plataforma* foi feita a reserva? (Airbnb, Booking ou Whatsapp)"
    );
    userState[userId].etapa = "saida-submenu-reserva";
    return;
  }

  if(userState[userId]?.etapa === "saida-submenu-reserva") {
    const chat = await msg.getChat();
    userState[userId].check_rsv_plataforma = msg.body; // checar reserva - plataforma

    await delay(1500);
    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(
      userId,
      `📌 *Detalhes da reserva:*\n\n👤 *Nome do titular:* ${userState[userId].check_rsv_titular}\n🌐 *Plataforma:* ${userState[userId].check_rsv_plataforma}\n\n⏳ Por favor, aguarde o contato da nossa equipe. Em breve, você receberá mais informações sobre sua reserva e poderá esclarecer qualquer dúvida. 😊`
    );
    await client.sendMessage(userId, menuMsg);
    return;
  }

  // SUBMENU DISPONIBILIDADE
  if (userState[userId]?.etapa === "menu-principal") {
    if (msg.body === "3") {
      const chat = await msg.getChat();
      userState[userId] = { etapa: "submenu-disponibilidade" };

      await delay(1500);
      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(
        userId,
        "Certo! Você está procurando disponibilidade.\n\nPor favor, escolha uma das opções abaixo:\n\n1️⃣ - Pesquisar disponibilidade por data\n2️⃣ - Ver calendário completo de disponibilidade"
      );

      return;
    }
  }

  // SUBMENU DISPONIBILIDADE - OPÇÃO 1 - PESQUISAR DISPONIBILIDADE
  if (userState[userId]?.etapa === "submenu-disponibilidade") {
    if (msg.body === "1") {
      const chat = await msg.getChat();
      userState[userId] = {
        etapa: "saida-pesquisa-data",
        data_pesquisa: null
      };

      await delay(1500);
      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(
      userId,
      "📅 Digite a *data para pesquisa* no formato DD/MM/AAAA:"
    );
      return;
    }
  }

  // SUBMENU DISPONIBILIDADE - OPÇÃO 2 - LINK COM CALENDARIO
  if (userState[userId]?.etapa === "submenu-disponibilidade") {
    if (msg.body === "2") {
      const chat = await msg.getChat();
      await delay(1500);
      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(
        userId,
        "No link abaixo, você pode verificar a disponibilidade de todos os apartamentos através do *Calendário do Google*:\n🌐 https://bit.ly/CalendarioUnificadoLeoeValeria"
      );

      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(
        userId,
        "\nVocê pode digite *menu* para ver o menu inicial."
      );
      return;
    }
  }

  // SUBMENU DISPONIBILIDADE - VERFICAR DISPONIBILIDADE VIA API
  if (userState[userId]?.etapa === "saida-pesquisa-data") {
    userState[userId].data_pesquisa = msg.body.trim();
    const { data_pesquisa } = userState[userId];
    const chat = await msg.getChat();

    await delay(1500);

    if (testeDataString(data_pesquisa)) {
      await client.sendMessage(userId, testeDataString(data_pesquisa));
      return;
    }

    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(userId, "Aguarde, verificando disponibilidade...");

    try {
      const result = await dataComparador(data_pesquisa);
      userState[userId].dataComparador = result;
      listaPesquisa.push(data_pesquisa);

      const msgResult = `${result[0].titulo}: ${result[0].disponibilidade ? "❌ Nenhum disponível" : "✅ Data disponível!"}\n${result[1].titulo}: ${result[1].disponibilidade ? "❌ Nenhum disponível" : "✅ Data disponível!"}\n${result[2].titulo}: ${result[2].disponibilidade ? "❌ Nenhum disponível" : "✅ Data disponível!"}`;

      console.log("Data pesquisada:", data_pesquisa);
      await delay(2000);
      await client.sendMessage(userId, msgResult);
      await delay(1000);
      await client.sendMessage(
        userId,
        "Digite:\n*1* - Pesquisar outra data\n*2* - Reservar essa data (você ainda poderá alterar a data de saída)\n*menu* - Voltar ao início"
      );

      userState[userId].etapa = "submenu-saida-pesquisa-data";
    } catch (er) {
      console.log("Erro ao comparar datas:", er);
      await client.sendMessage(userId, "Erro ao verificar disponibilidade.");
    }
  }

  // SUBMENU SAI PESQUISA DATA - OP 1
  if (userState[userId]?.etapa === "submenu-saida-pesquisa-data" && msg.body === "1") {
    const chat = await msg.getChat();
    listaPesquisa.length = 0;
    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(
      userId,
      "📅 Digite *outra data* (DD/MM/AAAA) para pesquisar ou *menu* para voltar ao início."
    );

    userState[userId].etapa = "saida-pesquisa-data";
    return;
  }
  // if (userState[userId]?.etapa === "submenu-saida-pesquisa-data" && msg.body === "1") {
  //   const chat = await msg.getChat();
  //   listaPesquisa.length = 0;
  //   await chat.sendStateTyping();
  //   await delay(1500);
  //   await client.sendMessage(userId, "Digite *outra data* (DD/MM/AAAA) para pesquisa ou *menu* para voltar.");
  //   userState[userId].etapa = "saida-pesquisa-data";
  // }

  // ESCOLHER APTO
  if (userState[userId]?.etapa === "escolher-apto") {
    const escolha = parseInt(msg.body.trim());
    const chat = await msg.getChat();

    if (isNaN(escolha) || escolha < 1 || escolha > 3) {
      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(userId, "⚠️ Opção inválida. Por favor, digite um número válido.");
      return;
    }

    const aptoEscolhido = userState[userId].dataComparador.filter(item => !item.disponibilidade)[escolha - 1];
    if (!aptoEscolhido) {
      await client.sendMessage(userId, "❌ O apartamento escolhido não está disponível.");
      return;
    }

    userState[userId].alugar_apto_escolha = aptoEscolhido.titulo;
    userState[userId].alugar_apto_valor = aptoEscolhido.valor;
    const dataCheckOut = dataConversor(userState[userId].data_pesquisa);
    userState[userId].data_checkout = dataCheckOut;

    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(
      userId,
      `🏠 ${aptoEscolhido.titulo}\n\nCheck-in: *${userState[userId].data_pesquisa}*\nHorario: *14:00h* \nCheck-out: *${dataCheckOut.getDate() + 1}/${dataCheckOut.getMonth() + 1}/${dataCheckOut.getFullYear()}*\nHorario: *12:00h*`
    );

    await chat.sendStateTyping();
    await delay(1000);
    await client.sendMessage(
      userId,
      "Digite:\n*1* para confirmar a reserva\n*2* para alterar a data de saída"
    );

    userState[userId].etapa = "submenu-escolher-apto";
    return;
  }

  // RESUMO DA RESERVA
  if (userState[userId]?.etapa === "submenu-escolher-apto" && msg.body === "1") {
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(
      userId,
      `📋 *Resumo da reserva*\n\n🏠 ${userState[userId].alugar_apto_escolha}\n📅 Check-in: ${userState[userId].data_pesquisa}\n*Horario: 14:00h* \n\n📆 Check-out: ${userState[userId].data_checkout.getDate() + 1}/${userState[userId].data_checkout.getMonth() + 1}/${userState[userId].data_checkout.getFullYear()}\n *Horario: 14:00* \n\n💰 *Valor da diária:* ${userState[userId].alugar_apto_valor}\n\n🙏 Agradecemos por escolher se hospedar conosco! Em breve, alguém da equipe irá confirmar sua reserva. Agora é só aguardar. 😊`
    );
    await client.sendMessage(userId, menuMsg);
  }

  // ALTERAR CHECK-OUT
  if (userState[userId]?.etapa === "alterar-checkout") {
    const novoCheckOut = msg.body.trim();

    if (testeDataString(novoCheckOut)) {
      await client.sendMessage(userId, testeDataString(userState[userId].data_pesquisa));
      return;
    }

    userState[userId].data_checkout = dataConversor(novoCheckOut); 
    
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(
      userId,
      `${userState[userId].alugar_apto_escolha}\n📅 *Check-in:* ${userState[userId].data_pesquisa}\n📆 *Check-out:* ${userState[userId].data_checkout.getDate()}/${userState[userId].data_checkout.getMonth() + 1}/${userState[userId].data_checkout.getFullYear()}\n💰 *Valor da diária:* ${userState[userId].alugar_apto_valor}\n\n🙏 Agradecemos por escolher se hospedar conosco! Em breve, alguém da equipe irá confirmar sua reserva. Agora é só aguardar. 😊`
    );
    await client.sendMessage(userId, menuMsg);
  }

  // ALTERAR CHECK-OUT
  if (userState[userId]?.etapa === "submenu-escolher-apto" && msg.body === "2") {
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(
      userId,
      "⚠️ *Atenção:* A data de check-out deve ser informada em formato de texto (*DD/MM/AAAA*). Ela será confirmada por nossa equipe conforme a disponibilidade.\n\nPedimos que verifique as datas acessando nosso calendário completo de disponibilidade ou revisando todas as datas que deseja reservar.\n\nCaso não haja disponibilidade para a data escolhida, você será informado por alguém da equipe. 😊"
    );
    await chat.sendStateTyping();
    await delay(1000);
    await client.sendMessage(userId, `Certo, agora digite a data de check-out.`);
    userState[userId].etapa = "alterar-checkout";
  }

  // SUBMENU SAI PESQUISA DATA - OP 2
  if (userState[userId]?.etapa === "submenu-saida-pesquisa-data" && msg.body === "2") {
    const chat = await msg.getChat();
    const dataCheckOut = dataConversor(userState[userId].data_pesquisa);
    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(userId, `Data de check-in: ${userState[userId].data_pesquisa}\nData de check-out: ${dataCheckOut.getDate() + 1}/${dataCheckOut.getMonth() + 1}/${dataCheckOut.getFullYear()}`);
    await delay(1500);

    const disponiveis = userState[userId]?.dataComparador
      .filter(item => !item.disponibilidade)
      .map((item, index) => `*${index + 1}* - ${item.titulo}: ✅ Data disponível!\nValor da diária: ${item.valor}`)
      .join('\n');

    await client.sendMessage(userId, `Apartamentos disponíveis:\n${disponiveis || "❌ Nenhum disponível para esta data."}`);
    await delay(1000);
    await client.sendMessage(userId, `Digite o número do apartamento desejado:`);

    userState[userId].etapa = "escolher-apto";
    return;
  }

  if (userState[userId]?.etapa === "saida-alugar-data" && msg.body === "1") {
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(userId, "Digite sua *próxima data* para pesquisar a disponibilidade");
    userState[userId].etapa = "saida-pesquisa-data";
  }

  if (userState[userId]?.etapa === "menu-principal" && msg.body === "4") {
    const chat = await msg.getChat();
    await chat.sendStateTyping();
    await delay(1500);
    await client.sendMessage(
      msg.from,
      "🏠 *Apartamentos disponíveis*\n\nTemos 3 opções de acomodações no mesmo prédio, todas bem localizadas — a apenas 500m do Santuário Nacional e próximas à feira, rodoviária e comércios locais. Clique no link abaixo para mais informações.\n\n✨ *Opções:*\n\n1️⃣ *Apartamento para até 10 pessoas*\nAmbiente completo e espaçoso, com 3 quartos, sala, cozinha equipada e todo o conforto para grupos grandes. 🛏️\n[https://www.airbnb.com.br/h/apartamento10pleoevaleria]\n[https://www.booking.com/Share-gzvF7Dh]\n\n2️⃣ *Apartamento para até 8 pessoas*\nTérreo, confortável e ideal para famílias. Possui cozinha completa, Wi-Fi e fácil acesso. 👨‍👩‍👧‍👦\n[https://www.airbnb.com.br/h/apartamento8pleoevaleria]\n[https://www.booking.com/Share-J4wbSC]\n\n3️⃣ *Apartamento para até 7 pessoas*\nAconchegante, bem ventilado e totalmente equipado. Perfeito para quem busca praticidade e tranquilidade. 🌿\n[https://www.airbnb.com.br/h/apartamento7pleoevaleria]\n[https://www.booking.com/Share-6mBo3b]\n\nTodos oferecem roupas de cama e banho, garagem gratis próxima e atendimento direto dos proprietários. 🤝"
    );
  }

  // SUBMENU ESPERAR ATENDIMENTO
  if (userState[userId]?.etapa === "menu-principal") {
    if (msg.body === "5") {
      const chat = await msg.getChat();

      await delay(1500);
      await chat.sendStateTyping();
      await delay(1500);
      await client.sendMessage(
        msg.from,
        "Tudo bem! Aguarde, alguém irá te atender em breve.\nVocê pode digitar *menu* a qualquer momento para interagir com o assistente.\n\nPara adiantar o atendimento, digite sua dúvida abaixo. Obrigado!"
      );
      await client.sendMessage(userId, menuMsg);
      return;
    }
  }
});