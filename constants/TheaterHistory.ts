export interface TheaterHistoryInfo {
  where: string;
  when: string;
  style: string;
  funFact: string;
}

export const THEATER_HISTORY_DATA: Record<string, TheaterHistoryInfo> = {
  kursaal: {
    where: "Bari, Largo Adua (sul lungomare).",
    when: "Inaugurato nel 1925 (riaperto nel 2021 dopo lunghi restauri).",
    style: "Mix elegante di Liberty (Art Nouveau) e Art Déco.",
    funFact: "\"Kursaal\" in tedesco significa \"Sala di cura\", un termine usato per i lussuosi saloni di ritrovo balneari del Novecento. Inoltre, all'ultimo piano nasconde la Sala Giuseppina, originariamente un appartamento privato con una spettacolare vetrata sul mare!"
  },
  petruzzelli: {
    where: "Bari, Corso Cavour (nel cuore del centro murattiano).",
    when: "Inaugurato nel 1903 (distrutto da un tragico incendio nel 1991 e riaperto nel 2009).",
    style: "Umbertino (uno stile eclettico e monumentale di fine Ottocento), inconfondibile per la sua facciata color \"rosso pompeiano\".",
    funFact: "È il quarto teatro più grande d'Italia! L'evento che ha segnato la sua storia è il devastante incendio doloso del 1991 che ne fece crollare la cupola. È stato poi fedelmente ricostruito seguendo il principio del \"com'era e dov'era\", restituendo alla città il suo simbolo dopo ben 18 anni di chiusura."
  },
  margherita: {
    where: "Bari, nel vecchio porto (Piazza IV Novembre), letteralmente circondato dal mare.",
    when: "Inaugurato nel 1914 (oggi, dopo lunghi restauri, è un polo per mostre d'arte contemporanea).",
    style: "Liberty (Art Nouveau) con influenze eclettiche e torri laterali maestose.",
    funFact: "È stato costruito interamente su pilastri immersi nell'acqua! Questo stratagemma geniale fu ideato per aggirare un accordo tra il Comune e la famiglia Petruzzelli, che vietava la costruzione di teatri concorrenti sul \"suolo\" pubblico barese. È uno dei pochissimi edifici in Europa costruiti in questo modo."
  },
  piccinni: {
    where: "Bari, Corso Vittorio Emanuele II (una delle vie più importanti del centro).",
    when: "Inaugurato nel 1854 (è in assoluto il teatro più antico di Bari!).",
    style: "Neoclassico, con la tradizionale e sfarzosa struttura a ferro di cavallo tipica del teatro \"all'italiana\".",
    funFact: "È intitolato al celebre compositore barese Niccolò Piccinni. Ma la vera chicca storica, perfetta come domanda per un quiz o un segreto da sbloccare, risale al 1944: durante la Seconda Guerra Mondiale il palcoscenico non ha ospitato artisti, ma ha accolto il primo Congresso dei Comitati di Liberazione Nazionale. Per qualche giorno, il Piccinni è stato di fatto il primo \"Parlamento\" dell'Italia libera!"
  }
};
