# OpenMTP Refined — UX and reliability fork

## Register

product

## Users

Persone che usano macOS per esplorare e trasferire file tra il computer e
dispositivi Android tramite MTP. L'interfaccia deve sostenere attività
operative, spesso con cartelle fotografiche grandi e molti elementi, senza
nascondere lo stato della connessione o del trasferimento.

## Product Purpose

Rendere i trasferimenti MTP più affidabili, leggibili e veloci da gestire
rispetto all'applicazione originale. Il successo consiste nel permettere
all'utente di capire immediatamente quale dispositivo è collegato, cosa è
selezionato, dove finiranno i file e se un'operazione è realmente iniziata.

## Brand Personality

Espressiva, chiara, affidabile. L'app segue il Material 3 Expressive con la
stessa mano del sito AnalogIA: colore pieno, carattere Google Sans Flex,
forme che cambiano e movimento a molla. Deve sembrare un prodotto curato e
riconoscibile, non un file manager generico, senza mai rendere meno leggibile
lo stato della connessione o di una copia.

## Anti-references

- Interfacce datate con icone generiche o controlli ambigui.
- Aspetto "neutro di sistema": grigi, bordi sottili, nessuna identità.
- Movimento che fa aspettare: ogni animazione risponde a un gesto o spiega
  un cambio di stato, e dura poco.
- Stati di trasferimento silenziosi che lasciano l'utente nel dubbio.
- Etichette tagliate con i puntini: se lo spazio manca si toglie un elemento
  intero, non mezza parola.
- Effetti visivi incoerenti tra tema chiaro e scuro, o tra i colori dell'app.

## Design Principles

1. Mostrare subito stato, direzione e avanzamento delle operazioni.
2. Rendere selezione, ricerca e navigazione prevedibili anche con molti file.
3. Colore, forma e movimento sono l'identità: ogni componente usa i ruoli
   colore M3, le forme e le molle del sistema, mai valori propri.
4. Conservare una grammatica visiva coerente tra Mac, telefono, temi e colori.
5. Preferire prestazioni e controllo dell'utente agli effetti costosi: niente
   animazioni proporzionali al numero di file.

## Accessibility & Inclusion

I controlli devono rimanere utilizzabili da tastiera e leggibili nei temi
chiaro e scuro. Le animazioni devono rispettare `prefers-reduced-motion` e
lasciare sempre disponibile un aggiornamento istantaneo equivalente.
