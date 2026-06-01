export interface GameItem {
  id: number;
  title: string;
  description: string;
  theaterId: string;
  theaterLabel: string;
  icon: any;
  iconBg: string;
}

export const GAMES: GameItem[] = [
  {
    id: 1,
    title: 'Occhio del Restauratore',
    description: "Trova le differenze tra le opere d'arte storiche del Petruzzelli.",
    theaterId: 'petruzzelli',
    theaterLabel: 'Teatro Petruzzelli',
    icon: 'color-palette',
    iconBg: '#FF6B6B',
  },
  {
    id: 2,
    title: 'Reperti e Intrusi',
    description: 'Scopri quali oggetti teatrali sono reperti storici e quali sono intrusi moderni scorrendo le carte!',
    theaterId: 'margherita',
    theaterLabel: 'Teatro Margherita',
    icon: 'albums',
    iconBg: '#4ECDC4',
  },
  {
    id: 3,
    title: 'Puzzle Drag & Drop',
    description: 'Ricostruisci la splendida facciata storica del Teatro Margherita trascinando le tessere al posto giusto!',
    theaterId: 'margherita',
    theaterLabel: 'Teatro Margherita',
    icon: 'grid',
    iconBg: '#448AFF',
  },
  {
    id: 4,
    title: 'Reperti e Intrusi',
    description: 'Scopri quali oggetti o luoghi appartengono al Teatro Piccinni e quali sono intrusi scorrendo le carte!',
    theaterId: 'piccinni',
    theaterLabel: 'Teatro Piccinni',
    icon: 'albums',
    iconBg: '#4ECDC4',
  },
  {
    id: 5,
    title: 'Puzzle Drag & Drop',
    description: 'Ricostruisci la splendida facciata storica del Teatro Kursaal Santalucia trascinando le tessere al posto giusto!',
    theaterId: 'kursaal',
    theaterLabel: 'Teatro Kursaal Santalucia',
    icon: 'grid',
    iconBg: '#66BB6A',
  },
  {
    id: 6,
    title: 'Il Quiz del Kursaal',
    description: 'Apri le casse misteriose e rispondi alle domande di curiosità, geografia e molto altro! Attento: se sbagli è Game Over!',
    theaterId: 'kursaal',
    theaterLabel: 'Teatro Kursaal Santalucia',
    icon: 'help-circle',
    iconBg: '#8D6E63',
  },
  {
    id: 7,
    title: 'Timeline Storica',
    description: 'Riordina gli eventi storici del Teatro Piccinni trascinandoli sulla linea del tempo.',
    theaterId: 'piccinni',
    theaterLabel: 'Teatro Piccinni',
    icon: 'time',
    iconBg: '#FFB300',
  },
  {
    id: 8,
    title: 'Puzzle Drag & Drop',
    description: 'Ricostruisci la splendida facciata storica del Teatro Piccinni trascinando le tessere al posto giusto!',
    theaterId: 'piccinni',
    theaterLabel: 'Teatro Piccinni',
    icon: 'grid',
    iconBg: '#E91E63',
  },
  {
    id: 9,
    title: 'Il Quiz del Piccinni',
    description: 'Apri le casse misteriose e rispondi alle domande sul Teatro Piccinni! Attento: se sbagli è Game Over!',
    theaterId: 'piccinni',
    theaterLabel: 'Teatro Piccinni',
    icon: 'help-circle',
    iconBg: '#8D6E63',
  },
];
