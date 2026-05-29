import { Figurinha } from '../types';

// Copa do Mundo 2026 - Álbum Panini
// Grupos: A-L (12 grupos com ~6 países cada) + especiais
// 32 seleções + Estádios + Especiais = ~670 figurinhas

const GRUPOS_PAISES: Record<string, { pais: string; jogadores: string[] }[]> = {
  'Grupo A': [
    {
      pais: 'México',
      jogadores: ['Guillermo Ochoa', 'Edson Álvarez', 'Hirving Lozano', 'Raúl Jiménez', 'Alexis Vega'],
    },
    {
      pais: 'Canadá',
      jogadores: ['Milan Borjan', 'Alphonso Davies', 'Jonathan David', 'Cyle Larin', 'Junior Hoilett'],
    },
    {
      pais: 'Peru',
      jogadores: ['Pedro Gallese', 'André Carrillo', 'Paolo Guerrero', 'Christian Cueva', 'Renato Tapia'],
    },
    {
      pais: 'Bolívia',
      jogadores: ['Carlos Lampe', 'Marcelo Martins', 'Juan Arce', 'Leonel Justiniano', 'Roberto Fernández'],
    },
  ],
  'Grupo B': [
    {
      pais: 'Brasil',
      jogadores: ['Alisson', 'Vinicius Jr', 'Rodrygo', 'Raphinha', 'Marquinhos'],
    },
    {
      pais: 'Equador',
      jogadores: ['Hernán Galíndez', 'Enner Valencia', 'Moisés Caicedo', 'Byron Castillo', 'Jeremy Sarmiento'],
    },
    {
      pais: 'Colômbia',
      jogadores: ['David Ospina', 'Luis Díaz', 'Falcao', 'James Rodríguez', 'Juan Cuadrado'],
    },
    {
      pais: 'Panamá',
      jogadores: ['Luis Mejía', 'Abdiel Arroyo', 'Rolando Blackburn', 'Ismael Díaz', 'Gabriel Torres'],
    },
  ],
  'Grupo C': [
    {
      pais: 'Argentina',
      jogadores: ['Emiliano Martínez', 'Lionel Messi', 'Ángel Di María', 'Lautaro Martínez', 'Rodrigo De Paul'],
    },
    {
      pais: 'Chile',
      jogadores: ['Claudio Bravo', 'Arturo Vidal', 'Alexis Sánchez', 'Charles Aránguiz', 'Ben Brereton'],
    },
    {
      pais: 'Venezuela',
      jogadores: ['Wuilker Faríñez', 'Salomón Rondón', 'Josef Martínez', 'Yeferson Soteldo', 'Darwin Machís'],
    },
    {
      pais: 'Jamaica',
      jogadores: ['Andre Blake', 'Leon Bailey', 'Bobby Reid', 'Michail Antonio', 'Demarai Gray'],
    },
  ],
  'Grupo D': [
    {
      pais: 'Espanha',
      jogadores: ['Unai Simón', 'Pedri', 'Gavi', 'Álvaro Morata', 'Rodri'],
    },
    {
      pais: 'Alemanha',
      jogadores: ['Manuel Neuer', 'Joshua Kimmich', 'Leroy Sané', 'Kai Havertz', 'Thomas Müller'],
    },
    {
      pais: 'Japão',
      jogadores: ['Shuichi Gonda', 'Takumi Minamino', 'Daichi Kamada', 'Ritsu Doan', 'Kaoru Mitoma'],
    },
    {
      pais: 'Costa Rica',
      jogadores: ['Keylor Navas', 'Bryan Ruiz', 'Joel Campbell', 'Celso Borges', 'Francisco Calvo'],
    },
  ],
  'Grupo E': [
    {
      pais: 'França',
      jogadores: ['Hugo Lloris', 'Kylian Mbappé', 'Antoine Griezmann', 'Ousmane Dembélé', 'Aurélien Tchouaméni'],
    },
    {
      pais: 'Holanda',
      jogadores: ['Jasper Cillessen', 'Virgil van Dijk', 'Frenkie de Jong', 'Memphis Depay', 'Cody Gakpo'],
    },
    {
      pais: 'Senegal',
      jogadores: ['Edouard Mendy', 'Sadio Mané', 'Kalidou Koulibaly', 'Idrissa Gueye', 'Ismaïla Sarr'],
    },
    {
      pais: 'Austrália',
      jogadores: ['Mat Ryan', 'Mathew Leckie', 'Aaron Mooy', 'Mitchell Duke', 'Martin Boyle'],
    },
  ],
  'Grupo F': [
    {
      pais: 'Portugal',
      jogadores: ['Rui Patrício', 'Cristiano Ronaldo', 'Bruno Fernandes', 'Bernardo Silva', 'Rafael Leão'],
    },
    {
      pais: 'Inglaterra',
      jogadores: ['Jordan Pickford', 'Harry Kane', 'Jude Bellingham', 'Bukayo Saka', 'Phil Foden'],
    },
    {
      pais: 'Irã',
      jogadores: ['Alireza Beiranvand', 'Sardar Azmoun', 'Mehdi Taremi', 'Ali Gholizadeh', 'Saman Ghoddos'],
    },
    {
      pais: 'Honduras',
      jogadores: ['Luis López', 'Alberth Elis', 'Anthony Lozano', 'Romell Quioto', 'Maynor Figueroa'],
    },
  ],
  'Grupo G': [
    {
      pais: 'Itália',
      jogadores: ['Gianluigi Donnarumma', 'Leonardo Bonucci', 'Marco Verratti', 'Lorenzo Insigne', 'Ciro Immobile'],
    },
    {
      pais: 'Bélgica',
      jogadores: ['Thibaut Courtois', 'Kevin De Bruyne', 'Romelu Lukaku', 'Eden Hazard', 'Jan Vertonghen'],
    },
    {
      pais: 'Marrocos',
      jogadores: ['Yassine Bounou', 'Achraf Hakimi', 'Hakim Ziyech', 'Youssef En-Nesyri', 'Romain Saïss'],
    },
    {
      pais: 'Coreia do Sul',
      jogadores: ['Kim Seung-gyu', 'Son Heung-min', 'Hwang Hee-chan', 'Lee Jae-sung', 'Kim Min-jae'],
    },
  ],
  'Grupo H': [
    {
      pais: 'Estados Unidos',
      jogadores: ['Matt Turner', 'Christian Pulisic', 'Tyler Adams', 'Weston McKennie', 'Giovanni Reyna'],
    },
    {
      pais: 'Uruguai',
      jogadores: ['Fernando Muslera', 'Luis Suárez', 'Edinson Cavani', 'Federico Valverde', 'Rodrigo Bentancur'],
    },
    {
      pais: 'Croácia',
      jogadores: ['Dominik Livaković', 'Luka Modrić', 'Ivan Perišić', 'Mateo Kovačić', 'Marcelo Brozović'],
    },
    {
      pais: 'Egito',
      jogadores: ['Mohamed El-Shenawy', 'Mohamed Salah', 'Ahmed Hegazi', 'Amr El-Sulaya', 'Ramadan Sobhi'],
    },
  ],
};

const ESTADIOS = [
  { nome: 'MetLife Stadium', cidade: 'Nova York / Nova Jersey' },
  { nome: 'AT&T Stadium', cidade: 'Dallas' },
  { nome: 'SoFi Stadium', cidade: 'Los Angeles' },
  { nome: 'Levi\'s Stadium', cidade: 'San Francisco' },
  { nome: 'Arrowhead Stadium', cidade: 'Kansas City' },
  { nome: 'Empower Field', cidade: 'Denver' },
  { nome: 'NRG Stadium', cidade: 'Houston' },
  { nome: 'State Farm Stadium', cidade: 'Glendale' },
  { nome: 'Lincoln Financial Field', cidade: 'Filadélfia' },
  { nome: 'Gillette Stadium', cidade: 'Boston' },
  { nome: 'Hard Rock Stadium', cidade: 'Miami' },
  { nome: 'Seattle Lumen Field', cidade: 'Seattle' },
  { nome: 'Estadio Azteca', cidade: 'Cidade do México' },
  { nome: 'Estadio BBVA', cidade: 'Monterrey' },
  { nome: 'Estadio Akron', cidade: 'Guadalajara' },
  { nome: 'BC Place', cidade: 'Vancouver' },
  { nome: 'BMO Field', cidade: 'Toronto' },
];

const LENDAS = [
  'Pelé', 'Diego Maradona', 'Ronaldo Fenômeno', 'Zinedine Zidane',
  'Ronaldinho Gaúcho', 'Miroslav Klose', 'Gerd Müller', 'Just Fontaine',
  'Roberto Baggio', 'David Beckham', 'Thierry Henry', 'Rivaldo',
  'Cafu', 'Roberto Carlos', 'Paolo Maldini',
];

const ESPECIAIS = [
  'Taça FIFA Copa do Mundo', 'Copa do Mundo 2026 Logo',
  'Bola Oficial 2026', 'Mascote Oficial',
  'Mapa Sedes', 'Abertura do Torneio',
  'Top Goleadores História', 'Campeões Históricos',
  'FIFA Fair Play', 'Destaque do Torneio',
];

// Gera todas as figurinhas
export function gerarFigurinhas(): Figurinha[] {
  const figurinhas: Figurinha[] = [];
  let numero = 1;

  // Especiais de abertura
  ESPECIAIS.forEach((nome) => {
    figurinhas.push({
      numero: String(numero).padStart(3, '0'),
      nome,
      grupo: 'Especiais',
      tipo: 'especial',
    });
    numero++;
  });

  // Times e jogadores por grupo
  Object.entries(GRUPOS_PAISES).forEach(([grupo, times]) => {
    times.forEach(({ pais, jogadores }) => {
      // Figurinha do escudo do time
      figurinhas.push({
        numero: String(numero).padStart(3, '0'),
        nome: `Escudo ${pais}`,
        grupo,
        tipo: 'time',
        pais,
      });
      numero++;

      // Jogadores
      jogadores.forEach((jogador) => {
        figurinhas.push({
          numero: String(numero).padStart(3, '0'),
          nome: jogador,
          grupo,
          tipo: 'jogador',
          pais,
        });
        numero++;
      });
    });
  });

  // Estádios
  ESTADIOS.forEach(({ nome, cidade }) => {
    figurinhas.push({
      numero: String(numero).padStart(3, '0'),
      nome: `${nome} - ${cidade}`,
      grupo: 'Estádios',
      tipo: 'estadio',
    });
    numero++;
  });

  // Lendas
  LENDAS.forEach((nome) => {
    figurinhas.push({
      numero: String(numero).padStart(3, '0'),
      nome,
      grupo: 'Lendas',
      tipo: 'lenda',
    });
    numero++;
  });

  return figurinhas;
}

export const TODAS_FIGURINHAS = gerarFigurinhas();

export const GRUPOS = [
  'Todos',
  'Especiais',
  ...Object.keys(GRUPOS_PAISES),
  'Estádios',
  'Lendas',
];

export const PAISES = [
  'Todos',
  ...Object.values(GRUPOS_PAISES)
    .flatMap((times) => times.map((t) => t.pais))
    .sort(),
];
