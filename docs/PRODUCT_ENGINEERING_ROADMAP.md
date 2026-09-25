# OpenMTP Refined — Product & Engineering Decision Paper

> Documento vivo per decisioni di prodotto, architettura, affidabilità, UX, bug e criteri di rilascio.

- **Ultimo aggiornamento:** 20 settembre 2026
- **Stato del documento:** baseline iniziale, derivata dal codice corrente e dalle decisioni già discusse
- **Ambito:** applicazione desktop macOS, collegamento Android USB/MTP, trasferimenti e futura modalità wireless
- **Regola principale:** nessuna schermata deve rimanere vuota o ambigua durante un'operazione asincrona

## 1. Perché esiste questo documento

Questo file è il riferimento unico per:

- registrare le decisioni prima di implementarle;
- distinguere funzioni già presenti, incomplete e pianificate;
- descrivere bug riproducibili e relativa priorità;
- definire come deve reagire l'app a errori, timeout e disconnessioni;
- impedire che una nuova modifica rompa trasferimenti, metadati, temi o accessibilità;
- stabilire quando una build può essere considerata pronta per il rilascio.

Non sostituisce `DESIGN.md`, `PRODUCT.md` o `docs/PERFORMANCE_AUDIT.md`: li completa con una roadmap verificabile e con il contratto di affidabilità dell'app.

## 2. Convenzioni di lavoro

Ogni nuova voce deve avere un identificativo e uno stato.

| Prefisso | Uso |
| --- | --- |
| `DEC` | decisione di prodotto o architettura |
| `BUG` | comportamento errato riproducibile |
| `UX` | modifica grafica o di interazione |
| `TECH` | debito tecnico, prestazioni o affidabilità |
| `TEST` | test automatico o manuale richiesto |
| `REL` | requisito per una release |

Stati ammessi: `Proposto`, `Accettato`, `In lavorazione`, `Implementato`, `Verificato`, `Rinviato`.

Una modifica può diventare `Verificata` solo indicando:

1. commit o build provata;
2. test eseguiti;
3. dispositivo e versione macOS/Android usati;
4. risultato atteso e risultato osservato.

## 3. Principi di prodotto non negoziabili

1. **Nessuno stato invisibile.** Connessione, scansione, caricamento, preparazione, trasferimento e verifica devono essere sempre riconoscibili.
2. **File invariati.** Il trasferimento copia i byte originali: niente compressione, ricodifica o alterazione intenzionale dei metadati.
3. **Errore azionabile.** Ogni errore mostrato all'utente deve spiegare cosa è successo e offrire un'azione coerente: riprova, riconnetti, cambia modalità, annulla o apri i dettagli.
4. **Disconnessione sicura.** I contenuti del telefono non devono restare visibili dopo che il dispositivo è stato scollegato.
5. **Prestazioni misurate.** Ogni ottimizzazione importante deve avere un test o una misura ripetibile, non solo una sensazione visiva.
6. **Temi equivalenti.** Ogni componente deve essere leggibile e completo sia in tema chiaro sia in tema scuro.
7. **Compatibilità esplicita.** Kalam e Legacy sono backend USB, non metodi di connessione differenti per l'utente comune.
8. **Progressive disclosure.** Le opzioni tecniche avanzate non devono complicare il percorso principale.

## 4. Baseline attuale

### Presente e utile

- separazione dei pannelli Mac e telefono;
- pulizia della sessione MTP alla disconnessione;
- protezione contro risultati obsoleti durante la navigazione asincrona;
- fasi di trasferimento già modellate: controllo, attesa, preparazione, trasferimento, completato, fallito;
- log di trasferimento con identificativo di sessione;
- clipboard preservata quando un trasferimento fallisce o il telefono si scollega;
- mappatura JavaScript dei 20 codici errore dichiarati dal backend nativo Go;
- deduplicazione e ordinamenti già ottimizzati rispetto all'implementazione originale;
- ricerca, filtri e virtualizzazione supportati dall'architettura corrente;
- font applicazione configurabile, con font di sistema come scelta raccomandata;
- icone differenziate per estensione e supporto dei temi.

### Presente ma incompleto

- caricamento del telefono: lo stato tecnico esiste solo in parte e non è rappresentato in modo affidabile nella UI;
- rilevamento USB: esiste, ma l'aggiornamento automatico è disattivato di default;
- timeout e recupero: alcuni retry esistono, ma non c'è un contratto unico e non tutte le Promise native hanno una scadenza;
- gestione errori: molti errori vengono soltanto scritti nei log;
- trasferimento: manca una fase esplicita di verifica d'integrità e manca un vero watchdog di stallo;
- filtri: tipo e intervallo di date devono filtrare senza cambiare l'ordinamento scelto;
- animazioni numeriche: devono essere presenti solo dove comunicano un cambiamento reale e rispettare `prefers-reduced-motion`.

### Pianificato

- connessione wireless tramite ADB Wireless Debugging;
- associazione guidata con codice a 6 cifre e, in seguito, QR code;
- catalogo centralizzato degli errori;
- test di fault injection per connessione, listing e trasferimenti;
- verifica opzionale post-trasferimento mediante dimensione e checksum.

## 5. Registro delle decisioni

### DEC-001 — Metodi di connessione principali

- **Stato:** Accettato
- **Decisione:** il selettore principale deve mostrare `USB` e `Wireless`.
- **Motivo:** Kalam e Legacy sono implementazioni MTP via cavo; chiamarle modalità principali confonde tecnologia interna e obiettivo dell'utente.
- **Conseguenza:** Kalam resta il backend USB raccomandato. Legacy rimane in `Impostazioni avanzate > Backend USB` come compatibilità.

### DEC-002 — Esperienza USB

- **Stato:** Accettato
- Collegando un telefono, il pannello destro passa immediatamente a `Dispositivo rilevato` e poi a `Lettura archivi`.
- Se il rilevamento automatico è disattivato, l'interfaccia deve dirlo chiaramente e offrire `Abilita rilevamento automatico`.
- Il pulsante Aggiorna resta un recupero manuale, non il percorso normale obbligatorio.

### DEC-003 — Esperienza Wireless

- **Stato:** Proposto
- **Tecnologia iniziale:** ADB Wireless Debugging su Android 11 o superiore, Mac e telefono sulla stessa rete locale.
- **Prima associazione:** l'utente apre `Opzioni sviluppatore > Debug wireless > Associa dispositivo con codice`, inserisce nell'app indirizzo, porta e codice temporaneo a 6 cifre.
- **Associazioni successive:** l'app conserva solo le informazioni necessarie nel Portachiavi macOS e tenta la riconnessione al dispositivo già autorizzato.
- **QR code:** previsto come secondo incremento, dopo una prima versione numerica stabile.
- **Nota di sicurezza:** le sei cifre sono un codice temporaneo di pairing, non un identificativo permanente del telefono e non devono essere salvate nei log.
- **Limite:** questa modalità non è MTP nativo; richiede un adapter ADB separato e deve essere presentata come tale.

### DEC-004 — Integrità dei file

- **Stato:** Accettato
- Il file copiato deve essere byte-per-byte identico quando il protocollo sorgente lo consente.
- Nessuna miniatura o anteprima può sostituire l'originale.
- Metadati incorporati nel file, come EXIF, XMP e profili colore, devono rimanere invariati.
- Date del filesystem e permessi possono differire tra Android e macOS: l'app deve documentarlo e, se possibile, ripristinarli esplicitamente.
- La verifica rapida usa dimensione; la verifica completa usa checksum ed è proposta per trasferimenti sensibili.

### DEC-005 — Macchina a stati esplicita

- **Stato:** Accettato
- La UI non deve dedurre lo stato soltanto da `nodes.length`, `isAvailable` e `isLoaded`.
- Connessione, directory e trasferimento devono avere macchine a stati indipendenti e finite.

### DEC-006 — Ricerca e filtri

- **Stato:** Accettato
- La ricerca per nome usa debounce, indicativamente 600–1000 ms, senza ricaricare la vista a ogni tasto.
- I risultati evidenziano le lettere corrispondenti e mostrano il percorso della cartella o del file.
- La ricerca gerarchica può usare una visita BFS per presentare prima i risultati più vicini, ma deve essere cancellabile e non bloccare il renderer.
- Il filtro per tipo e il filtro per intervallo di date restringono l'insieme; non sostituiscono l'ordinamento selezionato.
- L'utente sceglie se filtrare per data di creazione o modifica quando il filesystem fornisce entrambe in modo affidabile.

### DEC-007 — Selezione da tastiera

- **Stato:** Accettato
- Frecce: spostano il focus tra gli elementi.
- `Shift` + freccia: estende la selezione in modo continuo.
- `Cmd` + click o tastiera equivalente: modifica una selezione non contigua.
- La selezione non deve causare scansioni complete ripetute né re-render dell'intera griglia.

### DEC-008 — Sistema visivo

- **Stato:** Accettato
- Icone di azione: una sola famiglia coerente, preferibilmente Material Symbols o Lucide con licenza registrata.
- Icone dei file: famiglia Catppuccin già usata; estensioni mancanti possono essere disegnate nello stesso linguaggio, con sorgente e licenza documentate.
- DNG e JPG devono essere distinguibili senza affidarsi soltanto al colore.
- Nessuna animazione pulsante permanente nella barra laterale.
- Footer e toolbar devono mostrare gerarchia, stato e azioni senza duplicazioni.
- La scelta del font resta reversibile. Il font di sistema è predefinito; Faculty Glyphic è una preferenza opzionale, non deve compromettere leggibilità o allineamenti.

### DEC-009 — Motion e contatori

- **Stato:** Accettato
- Le animazioni numeriche sono ammesse per percentuale di trasferimento e conteggi che cambiano dopo la navigazione.
- Non devono riavviarsi per render non correlati.
- Con movimento ridotto attivo, il valore cambia senza interpolazione.

### DEC-010 — Ordine di sviluppo

- **Stato:** Accettato
- Prima si stabilizza USB: stati, timeout, errori, refresh e trasferimenti.
- Solo dopo si aggiunge Wireless attraverso la stessa interfaccia astratta di connessione.
- Motivo: aggiungere un secondo trasporto sopra stati ambigui raddoppierebbe i casi di errore.

## 6. Macchine a stati richieste

### 6.1 Connessione dispositivo

```text
disconnected
  -> detecting
  -> initializing
  -> loading_storages
  -> ready

Ogni stato operativo può passare a:
  -> recoverable_error -> retrying
  -> permission_required
  -> disconnected
  -> fatal_error
```

Requisiti UI:

- `detecting`: spinner discreto e testo `Ricerca del telefono…`;
- `initializing`: nome del dispositivo, se noto, e `Inizializzazione MTP…`;
- `loading_storages`: skeleton della lista e `Lettura degli archivi…`;
- `ready`: contenuti o stato cartella vuota;
- `permission_required`: istruzioni per sbloccare il telefono e selezionare Trasferimento file;
- `recoverable_error`: spiegazione breve, `Riprova` e `Dettagli`;
- `fatal_error`: nessun dato remoto obsoleto, suggerimento per cambiare backend o riconnettere il cavo.

### 6.2 Caricamento directory per ciascun pannello

```text
idle -> initial_loading -> ready
                     \-> empty
                     \-> error

ready -> refreshing -> ready | empty | error
ready -> navigating -> ready | empty | error
```

Durante `refreshing` o `navigating`, i dati precedenti possono restare visibili con un overlay non bloccante. Durante `initial_loading`, deve apparire uno skeleton. `nodes.length === 0` non basta per capire se una cartella è vuota o ancora in caricamento.

### 6.3 Trasferimento

```text
idle
 -> checking_destination
 -> waiting_for_user
 -> preparing
 -> transferring
 -> verifying
 -> completed

Da ogni fase operativa:
 -> cancelling -> cancelled
 -> stalled -> retrying | cancelled | failed
 -> disconnected -> retrying | failed
 -> failed
```

Ogni fase deve esporre attività recente, byte elaborati, file corrente e possibilità di annullamento sicuro.

## 7. Contratto degli errori

Ogni errore applicativo deve essere un oggetto strutturato, non una stringa libera.

```js
{
  code: 'MTP_STORAGE_UNAVAILABLE',
  stage: 'list_directory',
  severity: 'error',
  recoverable: true,
  deviceAvailable: true,
  userMessageKey: 'errors.mtpStorageUnavailable',
  suggestedAction: 'retry',
  technicalCause: '...',
  sessionId: '...'
}
```

Regole:

- il testo tecnico completo va nei log, non nel messaggio principale;
- segreti, codici di pairing e percorsi privati non devono finire nei log pubblici;
- un errore sconosciuto non può essere interpretato come successo;
- ogni operazione asincrona deve terminare in successo, errore, annullamento o timeout;
- i banner bloccanti non devono scomparire automaticamente dopo pochi secondi;
- Error Boundary React copre solo gli errori di render e non sostituisce la gestione di Promise, callback native e processi figli.

### Categorie minime da coprire

| Fase | Casi | Reazione richiesta |
| --- | --- | --- |
| Rilevamento | nessun dispositivo, più dispositivi, hotplug disattivato | stato esplicito e selezione/riprova |
| Inizializzazione | telefono bloccato, modalità USB errata, permesso negato, backend non disponibile | guida contestuale e retry limitato |
| Archivi | zero archivi, archivio non selezionato, storage rimosso | non restare in loading; tornare a selezione archivio |
| Directory | timeout, percorso non valido, permesso negato, risposta obsoleta | preservare vista valida e mostrare errore locale |
| Trasferimento | destinazione esistente, spazio insufficiente, sorgente scomparsa, cavo rimosso | interrompere in sicurezza e preservare clipboard |
| Integrità | dimensione diversa, checksum diverso, file parziale | marcare fallimento e offrire pulizia/riprova |
| Wireless | rete diversa, porta cambiata, pairing scaduto, ADB non trovato | wizard di riconnessione senza esporre segreti |
| Sistema | sospensione Mac, chiusura app, crash renderer/native | ripristino coerente e log correlato |

## 8. Audit del codice corrente

L'audit seguente è statico: identifica flussi e lacune nel sorgente corrente. Non equivale ancora a una campagna completa con dispositivi reali e fault injection.

### P0 — BUG-001: pannello telefono vuoto durante il collegamento

- **Stato:** Confermato dal codice
- **Sintomo:** il pannello destro resta bianco, poi i file compaiono di colpo; talvolta serve Aggiorna.
- **Causa 1:** `FileExplorerTableBodyRender` invia una lista vuota a `FileExplorerTableBodyEmptyRender`, ma quest'ultimo mostra lo stato di connessione soltanto quando `mtpDevice.isAvailable` è falso. Quando il dispositivo è già disponibile ma gli archivi o la directory sono ancora in lettura, viene renderizzata una riga vuota.
- **Causa 2:** `isLoaded` non viene riportato a `false` all'inizio di ogni nuova richiesta. L'overlay di `ToolbarBody` può quindi non comparire dopo il primo caricamento.
- **Causa 3:** l'hotplug è disattivato di default in `Settings/reducers.js`; l'attach automatico può non avviare alcuna inizializzazione finché l'utente non preme Aggiorna.
- **Correzione richiesta:** introdurre gli stati della sezione 6, azzerare sempre lo stato in `request/start`, chiuderlo in `success/failure/finally`, e rendere visibile il caricamento iniziale.
- **Accettazione:** entro 150 ms dal collegamento deve apparire uno stato; mai più di 500 ms di pannello privo di contenuto o feedback.

### P0 — BUG-002: refresh può usare il backend errato

- **Stato:** Probabile difetto confermato dalla struttura Redux
- `reloadDirList` legge `mtpMode` da `Home`, mentre la modalità è conservata in `Settings`.
- Un valore `undefined` può far ricadere il refresh nel ramo Kalam anche quando è selezionato Legacy.
- **Correzione richiesta:** selettore unico e tipizzato per la configurazione MTP, usato da inizializzazione, refresh e trasferimenti.

### P0 — BUG-003: archivio nullo lascia l'operazione senza esito

- **Stato:** Confermato dal codice
- Nel listing MTP, se `storageId` è nullo, la funzione può terminare anticipatamente senza errore utente e senza chiudere in modo affidabile lo stato di caricamento.
- **Correzione richiesta:** errore `MTP_STORAGE_NOT_SELECTED`, ritorno allo stato `loading_storages` o selezione guidata dell'archivio.

### P0 — TECH-001: Promise native senza timeout

- **Stato:** Confermato dal codice
- Le Promise create in `ffi/kalam/src/Kalam.js` dipendono dalla callback nativa e non hanno tutte un timeout.
- Se la callback non arriva, inizializzazione, listing o trasferimento possono restare pendenti indefinitamente.
- Alcuni `JSON.parse` sono eseguiti dentro callback senza protezione locale: una risposta malformata può lanciare un'eccezione senza risolvere né rifiutare la Promise.
- **Correzione richiesta:** wrapper comune `withNativeDeadline`, cleanup delle callback in `finally`, `try/catch` attorno al parsing e codici errore distinti per timeout e protocollo invalido.

### P0 — TECH-002: errori loggati senza transizione di stato

- **Stato:** Confermato dal codice
- Diversi `catch` di inizializzazione e listing chiamano `log.error` ma non aggiornano Redux, non chiudono `isLoading` e non offrono recupero.
- **Correzione richiesta:** ogni thunk deve dispatchare `request`, quindi esattamente uno fra `success`, `failure` o `cancelled`; `finally` deve liberare le risorse temporanee.

### P0 — TECH-003: errore MTP sconosciuto trattato come dispositivo disponibile

- **Stato:** Confermato dal codice
- Il ramo generico di `_processKalamMtpBuffer` può restituire `mtpStatus: true` anche in presenza di errore generale o valore non riconosciuto.
- Questo può dichiarare il telefono disponibile senza dati validi e contribuire al pannello vuoto.
- **Correzione richiesta:** fallback conservativo, errore strutturato e stato disponibilità deciso in base alla fase, mai successo implicito.

### P0 — BUG-004: trasferimento bloccato in preparazione o avanzamento

- **Stato:** Rischio confermato dal codice; sintomo già osservato
- L'interfaccia calcola il tempo dall'ultima attività, ma non trasforma l'inattività in uno stato `stalled`.
- La Promise di trasferimento può aspettare indefinitamente la callback nativa.
- **Correzione richiesta:** watchdog senza progresso, pulsanti `Attendi`, `Riprova` e `Annulla`, cancellazione cooperativa nativa e gestione del file parziale.
- **Nota:** il controllo duplicati deve usare una scansione indicizzata/batch e non una richiesta remota seriale per ogni file.

### P1 — TECH-004: retry duplicati

- **Stato:** Confermato dal codice
- `Kalam.initialize()` applica retry propri e `initKalamMtp()` aggiunge un secondo ciclo di retry.
- La combinazione può moltiplicare i tentativi e rendere imprevedibile il tempo di attesa.
- **Correzione richiesta:** una sola policy con numero di tentativi, backoff, deadline totale e messaggio di avanzamento.

### P1 — TECH-005: copertura errori nominale ma non comportamentale

- **Stato:** Confermato dal codice
- Enum JavaScript e Go risultano allineati, ma non esiste un test automatico che verifichi per ogni codice: messaggio, stato finale, disponibilità dispositivo e azione proposta.
- **Correzione richiesta:** test tabellare dell'intera matrice più caso sconosciuto.

### P1 — TECH-006: rilevamento automatico ambiguo

- **Stato:** Decisione richiesta durante l'implementazione
- L'hotplug disattivato di default riduce eventi inattesi, ma rende il comportamento simile a un bug.
- **Scelta raccomandata:** abilitarlo sui sistemi supportati; in caso contrario mostrare permanentemente lo stato `Rilevamento automatico disattivato`.

### P1 — TECH-007: verifica d'integrità e file parziali

- **Stato:** Mancante
- Il completamento oggi dipende dalla callback del backend; non è modellata una fase distinta di verifica.
- **Correzione richiesta:** almeno confronto dimensione; checksum opzionale; nome temporaneo `.part`; rename atomico solo a verifica conclusa; policy di pulizia esplicita.

### P2 — UX-001: durata dei messaggi

- **Stato:** Da rivedere
- Gli snackbar brevi sono adatti a conferme leggere, non a errori di connessione o perdita del dispositivo.
- Gli errori bloccanti devono restare visibili finché l'utente agisce o li chiude.

## 9. Backlog ordinato

### Milestone R1 — Connessione USB deterministica

- [ ] Implementare macchina a stati connessione e directory.
- [ ] Correggere selezione del backend in refresh.
- [ ] Gestire esplicitamente archivio nullo e zero archivi.
- [ ] Garantire `failure/finally` in ogni thunk MTP.
- [ ] Aggiungere timeout e parsing sicuro nel wrapper Kalam.
- [ ] Definire comportamento hotplug predefinito.
- [ ] Eliminare ogni pannello vuoto o stato non descritto.

### Milestone R2 — Trasferimenti affidabili

- [ ] Watchdog di attività e cancellazione reale.
- [ ] File temporanei e cleanup sicuro.
- [ ] Verifica dimensione e checksum opzionale.
- [ ] Strategia duplicati batch/indicizzata.
- [ ] Gestione spazio insufficiente prima di iniziare.
- [ ] Ripresa o retry per file, senza ricominciare l'intero batch quando possibile.

### Milestone R3 — UX e coerenza grafica

- [ ] Loading, empty, error e disconnected state in entrambi i temi.
- [ ] Checkbox e focus ring verificati in chiaro/scuro.
- [ ] Toolbar e footer con ordine e gerarchia coerenti.
- [ ] Icone file coerenti e licenze documentate.
- [ ] Navigazione e selezione completa da tastiera.
- [ ] Contatori animati con fallback reduced-motion.
- [ ] Ricerca con evidenziazione, percorso e debounce.
- [ ] Filtro tipo/data composabile senza alterare il sort.

### Milestone R4 — Wireless MVP

- [ ] Adapter `ConnectionProvider` comune a USB e ADB.
- [ ] Rilevamento disponibilità ADB senza download silenziosi.
- [ ] Wizard pairing numerico con validazione e scadenza.
- [ ] Credenziali nel Portachiavi macOS.
- [ ] Riconnessione con porta cambiata e rete diversa.
- [ ] Trasferimento byte-for-byte e verifica come USB.
- [ ] QR code soltanto dopo stabilità del pairing numerico.

## 10. Piano di test

### Test automatici minimi

1. **Reducer:** ogni evento produce uno stato valido e terminale.
2. **Error matrix:** tutti i codici Go/JavaScript e un codice sconosciuto.
3. **Timeout:** callback mai invocata, invocata in ritardo e invocata due volte.
4. **Parsing:** JSON malformato, buffer vuoto e payload parziale.
5. **Hotplug:** attach, detach durante listing, detach durante transfer, riconnessione di altro dispositivo.
6. **Directory:** storage nullo, cartella vuota, risposta obsoleta, doppio refresh.
7. **Trasferimento:** duplicato, spazio insufficiente, zero byte, file grande, cartella, cancellazione, file parziale.
8. **Filtri:** combinazioni tipo + data + ricerca + sort stabile.
9. **Tema:** snapshot o test visivo dei componenti interattivi in chiaro e scuro.

### Fault injection manuale

- bloccare il telefono durante l'inizializzazione;
- cambiare la modalità USB da MTP a sola ricarica;
- scollegare il cavo in ciascuna fase;
- sospendere e riattivare il Mac durante un trasferimento;
- revocare il permesso o rendere una cartella inaccessibile;
- riempire la destinazione fino a spazio insufficiente;
- simulare backend che non richiama la callback;
- per Wireless: spegnere Wi-Fi, cambiare rete, cambiare porta e far scadere il pairing.

### Matrice dispositivi iniziale

| Categoria | Minimo |
| --- | --- |
| Samsung recente | 1 dispositivo reale |
| Xiaomi/MIUI o HyperOS | 1 dispositivo reale |
| Android stock/Pixel | 1 dispositivo reale o emulatore per ADB |
| macOS | versione minima supportata + versione corrente |
| Architettura Mac | Apple Silicon; Intel prima di una release universale |

## 11. Criteri di accettazione misurabili

- feedback visivo di connessione entro 150 ms dall'evento ricevuto;
- nessun pannello vuoto per oltre 500 ms durante operazioni note;
- ogni richiesta di directory termina o va in timeout;
- nessun contenuto del telefono resta visibile dopo detach confermato;
- refresh manuale e hotplug conducono allo stesso stato finale;
- nessun trasferimento può restare indefinitamente in `preparing` o `transferring`;
- file dichiarato completato: dimensione verificata; checksum se richiesto;
- errore recuperabile: almeno un'azione valida disponibile;
- nessun codice di pairing nei log;
- temi chiaro/scuro e reduced-motion verificati prima della release.

## 12. Gate di release

Una build pubblica non è pronta finché non sono soddisfatti tutti i punti seguenti:

- [ ] lint e build completati senza errori;
- [ ] test JavaScript e Go verdi;
- [ ] suite di regressione connessione/trasferimento eseguita;
- [ ] test reale almeno su Samsung e Xiaomi;
- [ ] nessun P0 aperto;
- [ ] log controllati per dati sensibili;
- [ ] DMG avviato su installazione pulita;
- [ ] firma/notarizzazione definite per la distribuzione pubblica;
- [ ] changelog e limitazioni note aggiornati;
- [ ] screenshot README coerenti con la build rilasciata.

## 13. Registro iniziale dei problemi

| ID | Priorità | Stato | Sintesi |
| --- | --- | --- | --- |
| BUG-001 | P0 | Confermato | pannello telefono vuoto durante inizializzazione/listing |
| BUG-002 | P0 | Probabile | refresh legge la modalità MTP dal reducer errato |
| BUG-003 | P0 | Confermato | storage nullo può terminare senza stato finale |
| BUG-004 | P0 | Confermato come rischio | trasferimento senza watchdog può bloccarsi |
| TECH-001 | P0 | Confermato | operazioni native senza deadline uniforme |
| TECH-002 | P0 | Confermato | errori loggati senza aggiornare la UI |
| TECH-003 | P0 | Confermato | errore generico può lasciare dispositivo disponibile |
| TECH-004 | P1 | Confermato | retry duplicati e tempo totale poco prevedibile |
| TECH-005 | P1 | Confermato | enum allineati, comportamento non testato |
| TECH-006 | P1 | Aperto | hotplug predefinito crea ambiguità |
| TECH-007 | P1 | Mancante | verifica integrità e gestione file parziale |
| UX-001 | P2 | Aperto | errori importanti affidati a snackbar troppo brevi |

## 14. Template per le prossime modifiche

```md
### [ID] — Titolo breve

- Stato:
- Priorità:
- Versione target:
- Problema osservato:
- Passi per riprodurre:
- Comportamento atteso:
- Decisione:
- File interessati:
- Rischi:
- Test automatici:
- Test manuali:
- Evidenza di verifica:
```

## 15. Prossima azione raccomandata

La prima implementazione deve essere **R1 — Connessione USB deterministica**, iniziando da BUG-001. È il fondamento sia dei trasferimenti sia della futura modalità wireless. Il Wireless non deve essere aggiunto finché una connessione USB non produce sempre uno stato osservabile, un timeout e una via di recupero.

