const express = require('express');
const axios = require('axios');
const ical = require('ical.js');

const app = express();

// -------- Tratamento de erros ---------
const cors = require("cors"); // Use para tratar erros
app.use(cors());

const apartamentos = [
  {
    apto: "10 pessoas",
    links: {
      airbnb: "https://www.airbnb.com.br/calendar/ical/30253226.ics?s=480794fc2ea7ba9e80497a266e2f152d",
      booking: "https://ical.booking.com/v1/export?t=6a5ab3b4-98a7-4db6-abaf-cbb1d843586f"
    }
  },
  {
    apto: "8 pessoas",
    links: {
      airbnb: "https://www.airbnb.com.br/calendar/ical/892823308596337264.ics?s=812b266bcb6c0a40c209a94baed52d66",
      booking: "https://ical.booking.com/v1/export?t=27bed773-7e5f-423c-acc9-8e431710c041"
    }
  },
  {
    apto: "7 pessoas",
    links: {
      airbnb: "https://www.airbnb.com.br/calendar/ical/30335316.ics?s=e27d68518aaa7b62d84e1381cdebfd66",
      booking: "https://ical.booking.com/v1/export?t=d1bb0a9d-3041-41f9-8eac-a7c6d70da5ec"
    }
  }
];

// Rota apto 10 pessoas
app.get('/10Pessoas', async (req, res) => {
    console.log('~~ 10 Pessoas Calendar ~~\n');
    const respAirbnb = [];

    console.log('>Airbnb: Iniciando requisição');
    await axios.get(apartamentos[0].links.airbnb)
        .then(response => {
            console.log('>Airbnb: Requisição completa...');
            const data = response.data;

            const jcalData = ical.parse(data); // Parseiar os dados com ical.js

            const comp = new ical.Component(jcalData); // Acessar os componentes do calendário (vcalendar)

            console.log('Iniciando iteração\n');
            
            comp.getAllSubcomponents('vevent').forEach(event => { // Itera sobre os eventos (vevent) dentro do calendário
                const currentDate = {};
                // Acessa as propriedades do evento
                currentDate.summary = event.getFirstPropertyValue('summary');
                currentDate.startDate = event.getFirstPropertyValue('dtstart').toJSDate();
                currentDate.endDate = event.getFirstPropertyValue('dtend').toJSDate();

                // Exibe as informações do evento no console
                console.log('Summary:', currentDate.summary);
                console.log('Start Date:', currentDate.startDate);
                console.log('End Date:', currentDate.endDate);
                console.log('-------------------------');
                respAirbnb.push(currentDate);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar ou parsear o arquivo ICS:', error);
            res.status(500).send('Erro ao buscar ou parsear o arquivo ICS');
        });

    const respBooking = [];
    console.log('>Booking: Iniciando requisição');
    await axios.get(apartamentos[0].links.booking)
        .then(response => {
            console.log('>Booking: Requisição completa...');
            // Extrai o texto da resposta
            const data = response.data;

            // Parseia os dados com ical.js
            const jcalData = ical.parse(data);

            // Acessa os componentes do calendário (vcalendar)
            const comp = new ical.Component(jcalData);

            console.log('Iniciando iteração\n');
            // Itera sobre os eventos (vevent) dentro do calendário
            comp.getAllSubcomponents('vevent').forEach(event => {
                const currentDate = {};
                // Acessa as propriedades do evento
                currentDate.summary = event.getFirstPropertyValue('summary');
                currentDate.startDate = event.getFirstPropertyValue('dtstart').toJSDate();
                currentDate.endDate = event.getFirstPropertyValue('dtend').toJSDate();

                // Exibe as informações do evento no console
                console.log('Summary:', currentDate.summary);
                console.log('Start Date:', currentDate.startDate);
                console.log('End Date:', currentDate.endDate);
                console.log('-------------------------');
                respBooking.push(currentDate);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar ou parsear o arquivo ICS:', error);
            res.status(500).send('Erro ao buscar ou parsear o arquivo ICS');
        });

    console.log('\n~~ Fim ~~\n\n');

    const resp = [...respAirbnb, ...respBooking]
    res.send(resp);
});

// Rota apto 8 pessoas
app.get('/8Pessoas', async (req, res) => {
    console.log('~~ 8 Pessoas Calendar ~~\n');
    const respAirbnb = [];

    console.log('>Airbnb: Iniciando requisição');
    await axios.get(apartamentos[1].links.airbnb)
        .then(response => {
            console.log('> Requisição completa...');
            // Extrai o texto da resposta
            const data = response.data;

            // Parseia os dados com ical.js
            const jcalData = ical.parse(data);

            // Acessa os componentes do calendário (vcalendar)
            const comp = new ical.Component(jcalData);

            console.log('Iniciando iteração\n');
            // Itera sobre os eventos (vevent) dentro do calendário
            comp.getAllSubcomponents('vevent').forEach(event => {
                const currentDate = {};
                // Acessa as propriedades do evento
                currentDate.summary = event.getFirstPropertyValue('summary');
                currentDate.startDate = event.getFirstPropertyValue('dtstart').toJSDate();
                currentDate.endDate = event.getFirstPropertyValue('dtend').toJSDate();

                // Exibe as informações do evento no console
                console.log('Summary:', currentDate.summary);
                console.log('Start Date:', currentDate.startDate);
                console.log('End Date:', currentDate.endDate);
                console.log('-------------------------');
                respAirbnb.push(currentDate);
            });
            console.log('\n~~ Fim ~~\n\n');
        })
        .catch(error => {
            console.error('Erro ao buscar ou parsear o arquivo ICS:', error);
            res.status(500).send('Erro ao buscar ou parsear o arquivo ICS');
        });

    const respBooking = [];
    console.log('>Booking: Iniciando requisição');
    await axios.get(apartamentos[1].links.booking)
        .then(response => {
            console.log('>Booking: Requisição completa...');
            // Extrai o texto da resposta
            const data = response.data;

            // Parseia os dados com ical.js
            const jcalData = ical.parse(data);

            // Acessa os componentes do calendário (vcalendar)
            const comp = new ical.Component(jcalData);

            console.log('Iniciando iteração\n');
            // Itera sobre os eventos (vevent) dentro do calendário
            comp.getAllSubcomponents('vevent').forEach(event => {
                const currentDate = {};
                // Acessa as propriedades do evento
                currentDate.summary = event.getFirstPropertyValue('summary');
                currentDate.startDate = event.getFirstPropertyValue('dtstart').toJSDate();
                currentDate.endDate = event.getFirstPropertyValue('dtend').toJSDate();

                // Exibe as informações do evento no console
                console.log('Summary:', currentDate.summary);
                console.log('Start Date:', currentDate.startDate);
                console.log('End Date:', currentDate.endDate);
                console.log('-------------------------');
                respBooking.push(currentDate);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar ou parsear o arquivo ICS:', error);
            res.status(500).send('Erro ao buscar ou parsear o arquivo ICS');
        });

    console.log('\n~~ Fim ~~\n\n');

    const resp = [...respAirbnb, ...respBooking]
    res.send(resp);
});

// Rota apto 7 pessoas
app.get('/7Pessoas', async (req, res) => {
    console.log('~~ 7 Pessoas Calendar ~~\n');
    const respAirbnb = [];

    console.log('> Iniciando requisição');
    await axios.get(apartamentos[2].links.airbnb)
        .then(response => {
            console.log('> Requisição completa...');
            // Extrai o texto da resposta
            const data = response.data;

            // Parseia os dados com ical.js
            const jcalData = ical.parse(data);

            // Acessa os componentes do calendário (vcalendar)
            const comp = new ical.Component(jcalData);

            console.log('Iniciando iteração\n');
            // Itera sobre os eventos (vevent) dentro do calendário
            comp.getAllSubcomponents('vevent').forEach(event => {
                const currentDate = {};
                // Acessa as propriedades do evento
                currentDate.summary = event.getFirstPropertyValue('summary');
                currentDate.startDate = event.getFirstPropertyValue('dtstart').toJSDate();
                currentDate.endDate = event.getFirstPropertyValue('dtend').toJSDate();

                // Exibe as informações do evento no console
                console.log('Summary:', currentDate.summary);
                console.log('Start Date:', currentDate.startDate);
                console.log('End Date:', currentDate.endDate);
                console.log('-------------------------');
                respAirbnb.push(currentDate);
            });
            console.log('\n~~ Fim ~~\n\n');
        })
        .catch(error => {
            console.error('Erro ao buscar ou parsear o arquivo ICS:', error);
            res.status(500).send('Erro ao buscar ou parsear o arquivo ICS');
        });

    const respBooking = [];
    console.log('>Booking: Iniciando requisição');
    await axios.get(apartamentos[2].links.booking)
        .then(response => {
            console.log('>Booking: Requisição completa...');
            // Extrai o texto da resposta
            const data = response.data;

            // Parseia os dados com ical.js
            const jcalData = ical.parse(data);

            // Acessa os componentes do calendário (vcalendar)
            const comp = new ical.Component(jcalData);

            console.log('Iniciando iteração\n');
            // Itera sobre os eventos (vevent) dentro do calendário
            comp.getAllSubcomponents('vevent').forEach(event => {
                const currentDate = {};
                // Acessa as propriedades do evento
                currentDate.summary = event.getFirstPropertyValue('summary');
                currentDate.startDate = event.getFirstPropertyValue('dtstart').toJSDate();
                currentDate.endDate = event.getFirstPropertyValue('dtend').toJSDate();

                // Exibe as informações do evento no console
                console.log('Summary:', currentDate.summary);
                console.log('Start Date:', currentDate.startDate);
                console.log('End Date:', currentDate.endDate);
                console.log('-------------------------');
                respBooking.push(currentDate);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar ou parsear o arquivo ICS:', error);
            res.status(500).send('Erro ao buscar ou parsear o arquivo ICS');
        });

    console.log('\n~~ Fim ~~\n\n');

    const resp = [...respAirbnb, ...respBooking]
    res.send(resp);
});



let PORT = 1000;
// Iniciando o servidor
app.listen(PORT, () => {
    console.log(`\n>> API rodando na porta: ${PORT}\n`);
});