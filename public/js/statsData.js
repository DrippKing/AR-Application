// =====================================================
// statsData.js
// Base de datos estática de estadísticas por país
// - players: jugadores destacados actuales
// - stadium: estadio emblemático del país
// - worldCups: número de Copas del Mundo ganadas
// =====================================================

window.STATS_DB = {
  colombia: {
    countryLabel: "Colombia",
    players: [
      {
        name: "Luis Díaz",
        role: "Extremo",
        club: "Liverpool",
        note: "Desequilibrio, velocidad y gol."
      },
      {
        name: "James Rodríguez",
        role: "Mediocampista",
        club: "Club León",
        note: "Creatividad y liderazgo en el último tercio."
      },
      {
        name: "Jhon Arias",
        role: "Extremo / Volante",
        club: "Fluminense",
        note: "Intensidad, regate y movilidad ofensiva."
      }
    ],
    stadium: {
      name: "Estadio Metropolitano Roberto Meléndez",
      city: "Barranquilla",
      capacity: "46,000 aprox.",
      note: "Sede emblemática de la selección colombiana y uno de los estadios más reconocibles del país."
    },
    worldCups: 0,
    cupsLabel: "Copas del Mundo"
  },

  coreadelsur: {
    countryLabel: "Corea del Sur",
    players: [
      {
        name: "Son Heung-min",
        role: "Delantero / Extremo",
        club: "Tottenham Hotspur",
        note: "Figura internacional y referente ofensivo."
      },
      {
        name: "Lee Kang-in",
        role: "Mediapunta / Extremo",
        club: "Paris Saint-Germain",
        note: "Talento técnico y juego entre líneas."
      },
      {
        name: "Kim Min-jae",
        role: "Defensa central",
        club: "Bayern Munich",
        note: "Solidez defensiva y juego aéreo."
      }
    ],
    stadium: {
      name: "Seoul World Cup Stadium",
      city: "Seúl",
      capacity: "66,000 aprox.",
      note: "Uno de los estadios más representativos del fútbol surcoreano."
    },
    worldCups: 0,
    cupsLabel: "Copas del Mundo"
  },

  espana: {
    countryLabel: "España",
    players: [
      {
        name: "Rodri",
        role: "Mediocentro",
        club: "Manchester City",
        note: "Control del ritmo, recuperación y distribución."
      },
      {
        name: "Lamine Yamal",
        role: "Extremo",
        club: "FC Barcelona",
        note: "Desequilibrio, descaro y enorme proyección."
      },
      {
        name: "Pedri",
        role: "Mediocampista",
        club: "FC Barcelona",
        note: "Visión, pausa y asociación."
      }
    ],
    stadium: {
      name: "Santiago Bernabéu",
      city: "Madrid",
      capacity: "80,000 aprox.",
      note: "Uno de los recintos más icónicos del fútbol mundial."
    },
    worldCups: 1,
    cupsLabel: "Copas del Mundo"
  },

  japon: {
    countryLabel: "Japón",
    players: [
      {
        name: "Kaoru Mitoma",
        role: "Extremo",
        club: "Brighton & Hove Albion",
        note: "Uno contra uno, velocidad y profundidad."
      },
      {
        name: "Takefusa Kubo",
        role: "Extremo / Mediapunta",
        club: "Real Sociedad",
        note: "Creatividad y cambio de ritmo."
      },
      {
        name: "Wataru Endo",
        role: "Mediocentro",
        club: "Liverpool",
        note: "Equilibrio, presión y liderazgo."
      }
    ],
    stadium: {
      name: "Saitama Stadium 2002",
      city: "Saitama",
      capacity: "63,000 aprox.",
      note: "Estadio emblemático del fútbol japonés y referencia internacional."
    },
    worldCups: 0,
    cupsLabel: "Copas del Mundo"
  },

  mexico: {
    countryLabel: "México",
    players: [
      {
        name: "Edson Álvarez",
        role: "Mediocentro / Defensa",
        club: "West Ham United",
        note: "Recuperación, intensidad y liderazgo."
      },
      {
        name: "Santiago Giménez",
        role: "Delantero",
        club: "AC Milan",
        note: "Movilidad en el área y capacidad goleadora."
      },
      {
        name: "Raúl Jiménez",
        role: "Delantero",
        club: "Fulham",
        note: "Experiencia, juego de espaldas y remate."
      }
    ],
    stadium: {
      name: "Estadio Azteca",
      city: "Ciudad de México",
      capacity: "83,000 aprox.",
      note: "Recinto histórico del fútbol mundial y símbolo del fútbol mexicano."
    },
    worldCups: 0,
    cupsLabel: "Copas del Mundo"
  },

  paisesbajos: {
    countryLabel: "Países Bajos",
    players: [
      {
        name: "Virgil van Dijk",
        role: "Defensa central",
        club: "Liverpool",
        note: "Jerarquía defensiva y liderazgo."
      },
      {
        name: "Frenkie de Jong",
        role: "Mediocampista",
        club: "FC Barcelona",
        note: "Salida de balón y control del juego."
      },
      {
        name: "Cody Gakpo",
        role: "Extremo / Delantero",
        club: "Liverpool",
        note: "Gol, potencia y llegada."
      }
    ],
    stadium: {
      name: "Johan Cruijff Arena",
      city: "Ámsterdam",
      capacity: "55,000 aprox.",
      note: "Estadio emblemático del país y referente moderno del fútbol neerlandés."
    },
    worldCups: 0,
    cupsLabel: "Copas del Mundo"
  },

  sudafrica: {
    countryLabel: "Sudáfrica",
    players: [
      {
        name: "Ronwen Williams",
        role: "Portero",
        club: "Mamelodi Sundowns",
        note: "Reflejos, liderazgo y seguridad bajo palos."
      },
      {
        name: "Teboho Mokoena",
        role: "Mediocampista",
        club: "Mamelodi Sundowns",
        note: "Recorrido, recuperación y golpeo."
      },
      {
        name: "Percy Tau",
        role: "Delantero / Extremo",
        club: "Qatar SC",
        note: "Experiencia, desequilibrio y movilidad."
      }
    ],
    stadium: {
      name: "FNB Stadium (Soccer City)",
      city: "Johannesburgo",
      capacity: "94,000 aprox.",
      note: "El estadio más emblemático del país y sede histórica del Mundial 2010."
    },
    worldCups: 0,
    cupsLabel: "Copas del Mundo"
  },

  tunez: {
    countryLabel: "Túnez",
    players: [
      {
        name: "Youssef Msakni",
        role: "Delantero / Extremo",
        club: "Al-Arabi",
        note: "Talento ofensivo y experiencia internacional."
      },
      {
        name: "Ellyes Skhiri",
        role: "Mediocampista",
        club: "Eintracht Frankfurt",
        note: "Recuperación, orden y llegada."
      },
      {
        name: "Hannibal Mejbri",
        role: "Mediocampista ofensivo",
        club: "Burnley",
        note: "Energía, técnica y agresividad con balón."
      }
    ],
    stadium: {
      name: "Stade Olympique de Radès",
      city: "Túnez",
      capacity: "60,000 aprox.",
      note: "Uno de los recintos más importantes del fútbol tunecino."
    },
    worldCups: 0,
    cupsLabel: "Copas del Mundo"
  },

  uruguay: {
    countryLabel: "Uruguay",
    players: [
      {
        name: "Federico Valverde",
        role: "Mediocampista",
        club: "Real Madrid",
        note: "Despliegue físico, golpeo y liderazgo."
      },
      {
        name: "Darwin Núñez",
        role: "Delantero",
        club: "Liverpool",
        note: "Profundidad, potencia y amenaza constante."
      },
      {
        name: "Ronald Araújo",
        role: "Defensa central",
        club: "FC Barcelona",
        note: "Fuerza, velocidad y corrección defensiva."
      }
    ],
    stadium: {
      name: "Estadio Centenario",
      city: "Montevideo",
      capacity: "60,000 aprox.",
      note: "Símbolo absoluto del fútbol uruguayo e histórico a nivel mundial."
    },
    worldCups: 2,
    cupsLabel: "Copas del Mundo"
  },

  uzbekistan: {
    countryLabel: "Uzbekistán",
    players: [
      {
        name: "Eldor Shomurodov",
        role: "Delantero",
        club: "Roma",
        note: "Referente ofensivo y capitán de ataque."
      },
      {
        name: "Abbosbek Fayzullaev",
        role: "Extremo / Mediapunta",
        club: "CSKA Moscú",
        note: "Creatividad, desborde y juventud."
      },
      {
        name: "Otabek Shukurov",
        role: "Mediocampista",
        club: "Kayserispor",
        note: "Equilibrio, pase y trabajo táctico."
      }
    ],
    stadium: {
      name: "Bunyodkor Stadium",
      city: "Taskent",
      capacity: "34,000 aprox.",
      note: "Uno de los estadios más representativos del fútbol uzbeko."
    },
    worldCups: 0,
    cupsLabel: "Copas del Mundo"
  }
};