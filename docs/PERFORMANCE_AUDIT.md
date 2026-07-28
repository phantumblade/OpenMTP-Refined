# Audit prestazionale e complessità algoritmica

## Obiettivo e limiti

Questo documento descrive i percorsi prestazionali principali di OpenMTP e la
loro complessità asintotica. La notazione Big-O misura come cresce il lavoro al
crescere dei dati, ma non misura direttamente la latenza del disco, la decodifica
multimediale, la velocità USB o i tempi del protocollo MTP.

Non esiste una condizione verificabile chiamata "app completamente ottimizzata".
L'obiettivo concreto è evitare complessità superlineari non necessarie, non
bloccare il renderer e limitare il lavoro alla parte di interfaccia visibile.

Simboli usati:

- `n`: elementi presenti nella cartella corrente.
- `s`: elementi selezionati.
- `k`: elementi compresi in una selezione per intervallo.
- `v`: elementi attualmente renderizzati o vicini alla viewport.
- `b`: byte trasferiti.
- `p`: processi macOS esaminati per possibili conflitti USB.

## Risultati principali

| Percorso | Prima | Dopo | Nota |
| --- | ---: | ---: | --- |
| Lettura metadati di una cartella locale | `O(n)` I/O sequenziale e bloccante | `O(n)` I/O asincrono, concorrenza limitata a 64 | La Big-O non cambia, ma il renderer non viene bloccato e la latenza è sovrapposta in modo controllato. |
| Deduplicazione della coda di trasferimento | `O(n²)` | `O(n)` medio | Usa `Set`. |
| Verifica duplicati nel parser MTP legacy | `O(n²)` | `O(n)` medio | Usa un indice `Set` dei percorsi già incontrati. |
| Confronto non ordinato tra array | Fino a `O(n² log n)` e mutava gli input | `O(n log n)` | Ogni copia viene ordinata una sola volta. |
| Intersezione tra array | `O(n × m)` | `O(n + m)` medio | Indicizzazione del secondo array tramite `Set`. |
| Ricerca scorciatoia da tastiera | Visitava sempre tutte le regole | `O(q)` con uscita anticipata | `q` è piccolo e costante nella pratica. |
| Ordinamento file | `O(n log n)` a ogni render rilevante | `O(n log n)` quando cambiano dati/ordine; `O(1)` su click e selezioni | Il risultato ordinato e l'indice dei percorsi vengono memorizzati. |
| Ricerca indice per selezione Shift | `O(n + k)` | `O(k)` dopo la costruzione dell'indice | Gli estremi sono trovati in `O(1)` medio con `Map`. |
| Ricerca ultimo elemento selezionato | `O(n)` per operazione | `O(1)` medio dopo il primo indice | Usa una `Map` collegata all'array corrente. |
| Aggiornamento visuale della selezione | Più `setState`, fino a uno per elemento interessato | Un solo aggiornamento Redux e render dei soli elementi cambiati | Elimina stato React obsoleto e mutazioni dell'array di componenti. |
| Statistiche nella barra inferiore | `O(n)` a ogni selezione | `O(1)` sulle selezioni; `O(n)` solo quando cambia la cartella | Cache basata sull'identità dell'array dei nodi. |
| Rendering di cartelle grandi | Cresceva rapidamente fino a `O(n)` elementi DOM | `O(min(n, v))` anche dopo lo scroll | La finestra virtuale monta soltanto righe visibili e overscan; gli spaziatori conservano altezza e posizione. |
| Anteprime di immagini e video | Un `IntersectionObserver` e una decodifica autonoma per ogni elemento montato | `O(v)` elementi osservati, massimo 4 decodifiche iniziali concorrenti | Un observer condiviso, coda O(1) ammortizzata e registro LRU limitato a 500 chiavi già caricate. |
| Controllo esistenza di più file locali | `O(n)` chiamate sincrone in sequenza | `O(n)` asincrono a tranche, con uscita anticipata | Limite di 64 richieste concorrenti. |
| Risposte di navigazione concorrenti | Una risposta lenta poteva sovrascriverne una nuova | `O(1)` controllo versione richiesta | Solo l'ultima richiesta per pannello può aggiornare lo stato; la lettura locale obsoleta si ferma prima della tranche successiva. |
| Listener tastiera/IPC | Potevano accumularsi dopo i rimontaggi | Registrazione/rimozione `O(1)` simmetrica | Sono conservati gli stessi riferimenti alle callback. |

## Complessità che non può essere eliminata

### Ordinamento

Per un ordinamento generale basato su confronti, `O(n log n)` è il limite
asintotico corretto. La cache evita di ripeterlo quando cambia soltanto la
selezione.

### Selezione

- Click singolo o toggle: `O(s)` perché Redux conserva un array immutabile e la
  nuova selezione deve essere copiata.
- Seleziona tutto: `O(n)`, perché ogni percorso deve essere inserito.
- Shift: `O(k)` dopo l'indicizzazione, perché i `k` elementi del risultato devono
  comunque essere materializzati.

Convertire lo stato Redux direttamente in un `Set` renderebbe il toggle medio
`O(1)`, ma introdurrebbe valori non serializzabili e renderebbe più fragili
debug, persistenza e strumenti Redux. Il compromesso corrente privilegia
correttezza e compatibilità; le ricerche usano comunque `Set` e `Map` locali.

### Lettura cartelle

Elencare una cartella con `n` elementi richiede almeno `O(n)`. Ogni elemento
necessita dei metadati usati da interfaccia e ordinamento. Le operazioni sono ora
asincrone e raggruppate per non saturare il disco o bloccare Electron.

### Trasferimento file

Trasferire `b` byte richiede `O(b)`. Il limite dominante è la velocità USB, il
telefono e il protocollo MTP. La modalità Kalam delega il lavoro al backend
nativo. La modalità legacy esegue alcune operazioni in sequenza per evitare
comandi MTP concorrenti non sicuri: ridurre la latenza parallelizzandoli potrebbe
corrompere lo stato della sessione.

## Correzioni di correttezza collegate alle prestazioni

- Una selezione non viene più calcolata usando le props precedenti.
- Un doppio click in modalità multipla non applica due toggle opposti.
- Il click destro riceve sempre lo stato corrente tramite un getter stabile,
  senza costringere tutte le celle a un nuovo render.
- I risultati obsoleti di una lettura directory vengono ignorati.
- L'ordinamento dei numeri decimali verifica realmente `isFloat(item)`.
- Le funzioni di confronto non modificano più gli array ricevuti.

## Verifica

La baseline tecnica richiesta per ogni modifica prestazionale è:

1. lint senza errori;
2. build dei processi Electron main e renderer;
3. avvio della build di sviluppo;
4. prova su cartella piccola e cartella con molte foto/video;
5. prova di click singolo, toggle, Shift, Cmd, seleziona tutto e cambio rapido
   tra directory;
6. prova reale con telefono MTP collegato prima di dichiarare ottimizzata la
   parte USB.

Il calcolo puro della finestra può essere verificato in modo ripetibile con:

```sh
BABEL_CACHE_PATH=/tmp/openmtp-babel-benchmark.json NODE_ENV=test \
  .tooling/node-v16.20.2/bin/node -r @babel/register \
  scripts/performance/verify-file-explorer-window.js
```

La Big-O permette di escludere regressioni strutturali. Per misurare millisecondi,
memoria e frame persi servono inoltre profiling del renderer e test sul telefono
reale, perché questi valori non si deducono dalla sola complessità asintotica.
