/* =====================================================
   triviaData.js — WorldScan 2026
   Banco de preguntas por país (por ID de tu array countries)
   - Cada país: 5 preguntas (recomendado FE)
   - Cada pregunta: 4 opciones, 1 correcta (index)
   ===================================================== */

window.TRIVIA_DB = {
  // =========================
  // MÉXICO
  // =========================
  mexico: [
    {
      q: "¿Cuál es el apodo más común de la selección de México?",
      options: ["La Roja", "El Tri", "La Celeste", "Los Cafeteros"],
      correct: 1
    },
    {
      q: "¿Qué colores predominan en la bandera de México?",
      options: ["Verde, blanco y rojo", "Azul, blanco y rojo", "Negro y amarillo", "Rojo y blanco"],
      correct: 0
    },
    {
      q: "¿Cuántas Copas del Mundo ha ganado México (varonil) hasta hoy?",
      options: ["0", "1", "2", "3"],
      correct: 0
    },
    {
      q: "¿En qué año México organizó por primera vez un Mundial varonil?",
      options: ["1962", "1970", "1986", "1994"],
      correct: 1
    },
    {
      q: "¿Qué animal aparece en el escudo de la bandera de México?",
      options: ["León", "Águila", "Tigre", "Cóndor"],
      correct: 1
    }
  ],

  // =========================
  // JAPÓN
  // =========================
  japon: [
    {
      q: "¿Cómo se conoce comúnmente a la selección de Japón?",
      options: ["Samurai Blue", "Les Bleus", "Azzurri", "Los Tigres"],
      correct: 0
    },
    {
      q: "¿Qué elemento principal aparece en la bandera de Japón?",
      options: ["Una estrella", "Un círculo rojo", "Un dragón", "Tres franjas"],
      correct: 1
    },
    {
      q: "¿Qué color predomina en el fondo de la bandera de Japón?",
      options: ["Blanco", "Negro", "Verde", "Azul"],
      correct: 0
    },
    {
      q: "¿Cuál de estos es un logro histórico de Japón en Mundiales?",
      options: ["Campeón del Mundo", "Semifinalista", "Nunca ha clasificado", "Ganó 3 Mundiales"],
      correct: 1
    },
    {
      q: "En general, ¿qué confederación juega Japón?",
      options: ["CONMEBOL", "UEFA", "AFC", "CAF"],
      correct: 2
    }
  ],

  // =========================
  // ESPAÑA
  // =========================
  espana: [
    {
      q: "¿En qué año ganó España su primera Copa del Mundo varonil?",
      options: ["2002", "2006", "2010", "2014"],
      correct: 2
    },
    {
      q: "¿Cómo se apoda la selección de España?",
      options: ["La Roja", "La Verde", "La Celeste", "Los Vikingos"],
      correct: 0
    },
    {
      q: "¿Qué colores predominan en la bandera de España?",
      options: ["Rojo y amarillo", "Verde y blanco", "Azul y blanco", "Negro y rojo"],
      correct: 0
    },
    {
      q: "¿Qué continente representa España en competiciones FIFA?",
      options: ["Asia", "Europa", "África", "Oceanía"],
      correct: 1
    },
    {
      q: "¿Cuál de estos torneos también ganó España (selección mayor) además del Mundial?",
      options: ["Eurocopa", "Copa Oro", "Copa Asiática", "Copa Africana"],
      correct: 0
    }
  ],

  // =========================
  // COLOMBIA
  // =========================
  colombia: [
    {
      q: "¿Cómo se apoda comúnmente la selección de Colombia?",
      options: ["Los Cafeteros", "La Roja", "Los Charrúas", "Los Dragones"],
      correct: 0
    },
    {
      q: "¿Qué colores predominan en la bandera de Colombia?",
      options: ["Amarillo, azul y rojo", "Verde, blanco y rojo", "Azul y blanco", "Rojo y blanco"],
      correct: 0
    },
    {
      q: "¿Cuál ha sido el mejor resultado histórico de Colombia en un Mundial varonil?",
      options: ["Campeón", "Semifinal", "Cuartos de final", "Nunca ha clasificado"],
      correct: 2
    },
    {
      q: "Colombia pertenece a la confederación…",
      options: ["UEFA", "CONMEBOL", "CONCACAF", "AFC"],
      correct: 1
    },
    {
      q: "¿Cuál es la capital de Colombia?",
      options: ["Bogotá", "Medellín", "Cali", "Barranquilla"],
      correct: 0
    }
  ],

  // =========================
  // COREA DEL SUR
  // =========================
  coreadelsur: [
    {
      q: "¿Cuál es el mejor resultado histórico de Corea del Sur en un Mundial varonil?",
      options: ["Campeón", "Finalista", "Semifinal (4º lugar)", "No ha participado"],
      correct: 2
    },
    {
      q: "Corea del Sur pertenece a la confederación…",
      options: ["AFC", "UEFA", "CONMEBOL", "CAF"],
      correct: 0
    },
    {
      q: "¿Qué símbolo aparece en el centro de su bandera?",
      options: ["Un sol", "Un yin-yang (taeguk)", "Una estrella", "Un águila"],
      correct: 1
    },
    {
      q: "¿Qué colores dominan la bandera de Corea del Sur?",
      options: ["Negro y rojo", "Blanco con detalles negro/rojo/azul", "Verde y amarillo", "Azul y blanco"],
      correct: 1
    },
    {
      q: "Corea del Sur coorganizó un Mundial en…",
      options: ["1998", "2002", "2006", "2010"],
      correct: 1
    }
  ],

  // =========================
  // PAÍSES BAJOS
  // =========================
  paisesbajos: [
    {
      q: "¿Cuál es el color más asociado históricamente a la selección de Países Bajos?",
      options: ["Naranja", "Azul", "Verde", "Negro"],
      correct: 0
    },
    {
      q: "¿Países Bajos ha ganado un Mundial varonil hasta hoy?",
      options: ["Sí, 3", "Sí, 1", "No", "Sí, 2"],
      correct: 2
    },
    {
      q: "¿A qué confederación pertenece Países Bajos?",
      options: ["UEFA", "AFC", "CAF", "CONMEBOL"],
      correct: 0
    },
    {
      q: "¿Cuál de estas es una ciudad conocida de Países Bajos?",
      options: ["Ámsterdam", "Roma", "Lisboa", "Oslo"],
      correct: 0
    },
    {
      q: "Los colores de la bandera de Países Bajos son…",
      options: ["Rojo, blanco y azul", "Verde, blanco y rojo", "Azul y amarillo", "Negro, rojo y amarillo"],
      correct: 0
    }
  ],

  // =========================
  // SUDÁFRICA
  // =========================
  sudafrica: [
    {
      q: "¿En qué año Sudáfrica organizó la Copa del Mundo varonil?",
      options: ["2006", "2010", "2014", "2018"],
      correct: 1
    },
    {
      q: "Sudáfrica pertenece a la confederación…",
      options: ["CAF", "AFC", "UEFA", "CONCACAF"],
      correct: 0
    },
    {
      q: "El apodo común de la selección de Sudáfrica es…",
      options: ["Bafana Bafana", "Samurai Blue", "Los Cafeteros", "La Roja"],
      correct: 0
    },
    {
      q: "¿Qué continente representa Sudáfrica?",
      options: ["Europa", "África", "América", "Oceanía"],
      correct: 1
    },
    {
      q: "Una de las vuvuzelas se hizo famosa especialmente en el Mundial de…",
      options: ["1998", "2002", "2010", "2022"],
      correct: 2
    }
  ],

  // =========================
  // TÚNEZ
  // =========================
  tunez: [
    {
      q: "Túnez pertenece a la confederación…",
      options: ["CAF", "UEFA", "AFC", "CONMEBOL"],
      correct: 0
    },
    {
      q: "¿Qué colores predominan en la bandera de Túnez?",
      options: ["Rojo y blanco", "Verde y blanco", "Azul y amarillo", "Negro y rojo"],
      correct: 0
    },
    {
      q: "¿En qué continente está Túnez?",
      options: ["Asia", "Europa", "África", "Oceanía"],
      correct: 2
    },
    {
      q: "¿Qué símbolo destaca en la bandera de Túnez?",
      options: ["Una estrella y una luna creciente", "Un águila", "Un dragón", "Tres franjas"],
      correct: 0
    },
    {
      q: "La capital de Túnez es…",
      options: ["Túnez", "Sfax", "Susa", "Cartago"],
      correct: 0
    }
  ],

  // =========================
  // URUGUAY
  // =========================
  uruguay: [
    {
      q: "¿Cuántos Mundiales varoniles ganó Uruguay históricamente?",
      options: ["0", "1", "2", "3"],
      correct: 2
    },
    {
      q: "¿En qué año Uruguay ganó el primer Mundial de la historia?",
      options: ["1930", "1934", "1950", "1966"],
      correct: 0
    },
    {
      q: "Uruguay pertenece a la confederación…",
      options: ["CONMEBOL", "CONCACAF", "UEFA", "CAF"],
      correct: 0
    },
    {
      q: "¿Cómo se apoda la selección de Uruguay?",
      options: ["La Celeste", "La Roja", "Los Cafeteros", "Bafana Bafana"],
      correct: 0
    },
    {
      q: "¿Cuál es la capital de Uruguay?",
      options: ["Montevideo", "Punta del Este", "Salto", "Colonia"],
      correct: 0
    }
  ],

  // =========================
  // UZBEKISTÁN
  // =========================
  uzbekistan: [
    {
      q: "Uzbekistán pertenece a la confederación…",
      options: ["AFC", "UEFA", "CAF", "CONMEBOL"],
      correct: 0
    },
    {
      q: "¿En qué continente se encuentra Uzbekistán?",
      options: ["Europa", "Asia", "África", "Oceanía"],
      correct: 1
    },
    {
      q: "Los colores principales de la bandera de Uzbekistán incluyen…",
      options: ["Azul, blanco y verde", "Rojo, blanco y azul", "Negro y amarillo", "Verde y naranja"],
      correct: 0
    },
    {
      q: "La capital de Uzbekistán es…",
      options: ["Taskent", "Samarkanda", "Bujará", "Andiyán"],
      correct: 0
    },
    {
      q: "¿Qué símbolo aparece en la bandera de Uzbekistán?",
      options: ["Sol y estrellas", "Media luna y estrellas", "Águila", "Dragón"],
      correct: 1
    }
  ]
};
