# OpenMTP — UX and reliability fork

[![Platform](https://img.shields.io/badge/platform-macOS-000000?logo=apple)](https://www.apple.com/macos/)
[![Electron](https://img.shields.io/badge/Electron-18.3.15-47848f?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-17.0.2-61dafb?logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Fork indipendente di
[OpenMTP](https://github.com/ganeshrvel/openmtp), il file manager open source
per trasferire file via USB/MTP tra macOS e dispositivi Android.

Questo progetto mantiene l'architettura Electron, React e Go/Kalam di OpenMTP
e interviene su tre aree: affidabilità dei trasferimenti, prestazioni nelle
cartelle grandi ed esperienza d'uso. Non è una release ufficiale del progetto
originale.

## Stato del progetto

| Area                   | Stato                                 |
| ---------------------- | ------------------------------------- |
| Build del sorgente     | Verificata su Apple Silicon           |
| Lint JavaScript e SCSS | Superato                              |
| Test prestazionali     | Superati                              |
| Test nativi Go         | Superati                              |
| Pacchetto pubblico DMG | Non ancora distribuito                |
| Runtime Electron       | Migrazione da Electron 18 pianificata |

> [!IMPORTANT]
> Il sorgente può essere avviato e testato localmente. Non vengono ancora
> pubblicati DMG perché Electron 18 è fuori supporto e la pipeline di firma e
> notarizzazione non è stata completata.

## Perché questo fork

OpenMTP è una base completa, ma durante l'uso reale con cartelle fotografiche,
trasferimenti multipli e telefoni diversi sono emerse aree migliorabili:

- operazioni che sembravano ferme durante la preparazione;
- stato del telefono rimasto visibile dopo la disconnessione;
- selezione e navigazione difficili nelle cartelle molto grandi;
- anteprime e rendering costosi;
- messaggi USB poco comprensibili;
- interfaccia non completamente localizzata.

Il fork affronta questi problemi senza sostituire il protocollo MTP o il kernel
Kalam originale.

## Miglioramenti principali

### Trasferimenti e connessione

- Macchina a stati esplicita per controllo, preparazione, trasferimento,
  completamento ed errore.
- Feedback immediato all'avvio dell'operazione.
- Progresso, velocità, file corrente e identificativo diagnostico.
- Coordinatore nativo che serializza le operazioni Kalam sensibili.
- Retry limitati, normalizzazione degli errori USB e recupero della sessione.
- Pulizia dello stato e dei contenuti obsoleti dopo la disconnessione.

### Prestazioni

- Rendering virtualizzato nelle viste a griglia e a elenco.
- Indici `Map` e insiemi di selezione `Set`.
- Caricamento condiviso delle anteprime con concorrenza limitata.
- Ricerca breadth-first con budget distinti per filesystem locale e MTP.
- Test di correttezza e micro-benchmark riproducibili.

Complessità, compromessi e limiti delle misurazioni sono descritti in
[docs/PERFORMANCE_AUDIT.md](docs/PERFORMANCE_AUDIT.md).

### Interfaccia

- Ricerca esatta, per prefisso, sottostringa e corrispondenza fuzzy.
- Modalità di selezione multipla visibile e controllabile da tastiera.
- Anteprime per immagini e video locali compatibili.
- Toolbar, footer, breadcrumb e pannello laterale riorganizzati.
- Icone differenziate per file, cartelle, volumi e dispositivi.
- Tema chiaro e scuro.
- Interfaccia italiana e inglese selezionabile dalle impostazioni.

## Architettura essenziale

```text
app/
├── components/              Componenti condivisi
├── containers/HomePage/     Esplorazione, selezione e trasferimenti
├── data/file-explorer/      Repository e sorgenti dati locale/MTP
├── helpers/                 Ricerca, preview, device e transfer state
└── i18n/                    Localizzazione

ffi/kalam/
├── src/Kalam.js             Bridge JavaScript
└── native/                  Kernel e coordinatore MTP in Go

scripts/performance/         Test e micro-benchmark
```

## Avvio rapido

### Requisiti attuali

- macOS 11 o successivo
- Node.js 16
- Yarn 1.22
- Xcode Command Line Tools
- Go, se si modifica o verifica il componente nativo

```bash
yarn install --frozen-lockfile
yarn dev
```

L'applicazione avviata con `yarn dev` usa direttamente il sorgente corrente ed
è quindi la versione corretta da provare durante lo sviluppo.

## Verifiche automatiche

Esegue lint JavaScript, test prestazionali e test Go:

```bash
yarn test
```

Controlla gli stili:

```bash
yarn lint-styles
```

Genera i bundle di produzione:

```bash
yarn build
```

## Prova manuale consigliata

Usare inizialmente file di prova o copie, non l'unica copia di fotografie e
video importanti.

1. Avviare l'app con `yarn dev`.
2. Collegare il telefono sbloccato con modalità USB **Trasferimento file**.
3. Verificare che marca e modello del dispositivo siano riconosciuti.
4. Aprire cartelle grandi in vista griglia e lista.
5. Provare ricerca, selezione multipla e navigazione da tastiera.
6. Trasferire una piccola cartella dal Mac al telefono.
7. Trasferire la stessa cartella dal telefono al Mac.
8. Scollegare il telefono e controllare che i contenuti MTP scompaiano.
9. Ricollegarlo e verificare che la sessione venga ricreata correttamente.

## Pacchetto macOS locale

Per generare un pacchetto di sviluppo non notarizzato:

```bash
yarn package-mac-without-notarize
```

Gli artefatti vengono salvati nella directory ignorata `release/`. Un pacchetto
non firmato è destinato esclusivamente ai test locali.

## Roadmap prima del DMG pubblico

- Migrare a una versione Electron supportata.
- Eseguire regressioni su Intel e Apple Silicon.
- Verificare Samsung e almeno un dispositivo Android di un altro produttore.
- Sostituire l'icona privata con un'identità originale e documentata.
- Assegnare al fork un application identifier indipendente.
- Configurare aggiornamenti, firma Developer ID e notarizzazione.
- Verificare il DMG in un account macOS pulito.

## Sicurezza e privacy

Non inserire nel repository log non censurati, serial number, percorsi
personali, token, certificati o screenshot con dati privati. Le vulnerabilità
devono essere segnalate seguendo [SECURITY.md](SECURITY.md).

## Crediti e licenza

OpenMTP è stato creato da
[Ganesh Rathinavel](https://github.com/ganeshrvel) ed è distribuito con licenza
MIT. Questo fork conserva la cronologia e il copyright originale; le modifiche
sono distribuite con la stessa licenza.

- [LICENSE](LICENSE)
- [NOTICE.md](NOTICE.md)
- [Licenze degli asset di terze parti](THIRD_PARTY_NOTICES)
- [CHANGELOG.md](CHANGELOG.md)

OpenMTP e questo fork non sono prodotti ufficiali di Google, Samsung, Apple o
dei produttori dei dispositivi supportati.
