const express = require("express");
const axios = require("axios");
const ical = require("ical.js");
const cors = require("cors");

const app = express();
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

const fetchCalendar = async (url) => {
  const resp = [];
  try {
    const response = await axios.get(url);
    const data = response.data;
    const jcalData = ical.parse(data);
    const comp = new ical.Component(jcalData);

    comp.getAllSubcomponents("vevent").forEach((event) => {
      resp.push({
        summary: event.getFirstPropertyValue("summary"),
        startDate: event.getFirstPropertyValue("dtstart").toJSDate(),
        endDate: event.getFirstPropertyValue("dtend").toJSDate()
      });
    });
  } catch (err) {
    console.error("Erro ao buscar ICS:", err.message);
  }
  return resp;
};

app.get("/:apto", async (req, res) => {
  const { apto } = req.params;
  const indexMap = { "10Pessoas": 0, "8Pessoas": 1, "7Pessoas": 2 };
  const idx = indexMap[apto];

  if (idx === undefined) return res.status(400).send("Apartamento inválido");

  const airbnb = await fetchCalendar(apartamentos[idx].links.airbnb);
  const booking = await fetchCalendar(apartamentos[idx].links.booking);

  res.send([...airbnb, ...booking]);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API de calendário rodando em http://localhost:${PORT}`);
});
