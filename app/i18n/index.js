import { APP_LANGUAGE_TYPE, DEVICE_TYPE } from '../enums';

const italian = {
  'Sort by': 'Ordina per',
  '{field}, {direction}. Click to reverse':
    '{field}, {direction}. Clic per invertire',
  ascending: 'crescente',
  descending: 'decrescente',
  Actions: 'Azioni',
  'No favorites yet': 'Ancora nessun preferito',
  'Fewer connection hiccups': 'Meno intoppi nel collegamento',
  'When the macOS Photos service holds on to your phone, OpenMTP releases it for you.':
    'Se il servizio Foto di macOS tiene occupato il telefono, OpenMTP lo libera al posto tuo.',
  'Clear help when something goes wrong': 'Aiuto chiaro quando qualcosa non va',
  'If the connection fails, OpenMTP tells you why and what to do next.':
    'Se il collegamento non riesce, OpenMTP ti dice perché e cosa fare.',
  'Keep up to 5 folders one click away in the side menu.':
    'Tieni fino a 5 cartelle a portata di clic nel menu laterale.',
  'Filters by date and type': 'Filtri per data e tipo',
  "Find yesterday's photos or only the videos, with dates in your language's format.":
    'Trova le foto di ieri o solo i video, con le date nel formato italiano.',
  'Transfers you can follow': 'Trasferimenti sotto controllo',
  'See each step, the speed and the file being copied, on a smooth progress bar.':
    'Vedi ogni fase, la velocità e il file in copia, con una barra che avanza fluida.',
  'You decide which folders OpenMTP opens':
    'Decidi tu quali cartelle apre OpenMTP',
  'Before macOS asks for Desktop, Documents or Downloads, OpenMTP explains why. Change it anytime in Settings.':
    'Prima che macOS chieda l’accesso a Scrivania, Documenti o Download, OpenMTP ti spiega perché. Puoi cambiare idea quando vuoi nelle Impostazioni.',
  'Material 3 Expressive design': 'Design Material 3 Expressive',
  "Google's colors, shapes and motion, in light and dark themes.":
    'Colori, forme e animazioni di Google, con tema chiaro e scuro.',
  'In your language': 'Nella tua lingua',
  "OpenMTP starts in your Mac's language. You can change it, and the font, in Settings.":
    'OpenMTP parte nella lingua del tuo Mac. Puoi cambiarla, insieme al carattere, nelle Impostazioni.',
  "Here's what's new in version {version}.":
    'Ecco le novità della versione {version}.',
  Documents: 'Documenti',
  'Let OpenMTP open “{name}”?': 'Vuoi che OpenMTP apra “{name}”?',
  'macOS protects this folder. When you continue, macOS asks whether OpenMTP can open it: choose Allow.':
    'macOS protegge questa cartella. Quando continui, macOS ti chiede se OpenMTP può aprirla: scegli Consenti.',
  '“{name}” is closed to OpenMTP': '“{name}” è chiusa per OpenMTP',
  'You chose not to let OpenMTP open this folder. You can allow it now, or later in Settings → Privacy.':
    'Hai scelto di non far aprire questa cartella a OpenMTP. Puoi consentirlo ora o in seguito da Impostazioni → Privacy.',
  'macOS blocked “{name}”': 'macOS ha bloccato “{name}”',
  'Open System Settings → Privacy & Security → Files and Folders, turn on this folder for OpenMTP, then try again.':
    'Apri Impostazioni di Sistema → Privacy e sicurezza → File e cartelle, attiva questa cartella per OpenMTP e riprova.',
  'OpenMTP reads it only when you open it, to show and copy your files.':
    'OpenMTP la legge solo quando la apri, per mostrare e copiare i tuoi file.',
  'Nothing leaves your Mac except the files you copy to your phone.':
    'Dal Mac non esce nulla, tranne i file che copi sul telefono.',
  "Don't allow": 'Non consentire',
  'Not now': 'Non ora',
  'System Settings': 'Impostazioni di Sistema',
  Allow: 'Consenti',
  Continue: 'Continua',
  'External and removable disks': 'Dischi esterni e rimovibili',
  'Folder access': 'Accesso alle cartelle',
  'macOS protects some folders and asks before an app opens them. Choose which ones OpenMTP can use: it asks only when you open them.':
    'macOS protegge alcune cartelle e chiede il permesso prima che un’app le apra. Scegli quali può usare OpenMTP: le chiede solo quando le apri.',
  'OpenMTP explains and asks you first': 'OpenMTP ti spiega e chiede prima',
  Allowed: 'Consentito',
  'Blocked by macOS': 'Bloccato da macOS',
  'Not used by OpenMTP': 'Non usata da OpenMTP',
  "Don't use": 'Non usare',
  'Allowed by Full Disk Access': 'Consentito dall’accesso completo al disco',
  'Full Disk Access': 'Accesso completo al disco',
  'On: OpenMTP can open every folder without asking.':
    'Attivo: OpenMTP può aprire ogni cartella senza chiedere.',
  'Optional, not needed. Lets OpenMTP open every folder without asking.':
    'Facoltativo, non necessario. Permette a OpenMTP di aprire ogni cartella senza chiedere.',
  '{count} results in “{folder}” and subfolders':
    '{count} risultati in “{folder}” e sottocartelle',
  'This Mac': 'Questo Mac',
  'Local files': 'File locali',
  'Used space': 'Spazio usato',
  '{free} free of {total}': '{free} liberi su {total}',
  'Get started': 'Inizia',
  'Files and transfers': 'File e trasferimenti',
  'Look and feel': 'Aspetto',
  'Welcome to OpenMTP Refined': 'Benvenuto in OpenMTP Refined',
  'Favorite folders': 'Cartelle preferite',
  Settings: 'Impostazioni',
  General: 'Generali',
  'File Manager': 'Gestione file',
  Updates: 'Aggiornamenti',
  Privacy: 'Privacy',
  Language: 'Lingua',
  English: 'Inglese',
  Italian: 'Italiano',
  'Interface font': 'Carattere dell’interfaccia',
  'System default (recommended)': 'Predefinito di sistema (consigliato)',
  'Choose the typeface used throughout the app.':
    'Scegli il carattere usato in tutta l’app.',
  'Font preview': 'Anteprima del carattere',
  'Mac, phone, folders and files': 'Mac, telefono, cartelle e file',
  Theme: 'Aspetto',
  Light: 'Chiaro',
  Dark: 'Scuro',
  Auto: 'Automatico',
  'MTP Mode': 'Modalità MTP',
  'Enable auto device detection (USB Hotplug)':
    'Rileva automaticamente i dispositivi USB',
  Enabled: 'Attivo',
  Disabled: 'Disattivato',
  'Show hidden files': 'Mostra file nascosti',
  'View as grid': 'Vista a griglia',
  'Display overall progress on the file transfer screen':
    'Mostra l’avanzamento complessivo durante il trasferimento',
  'Show directories first': 'Mostra prima le cartelle',
  'Show status bar': 'Mostra la barra di stato',
  'Show Local Disk pane': 'Mostra il pannello del Mac',
  'Show Local Disk pane on the left side':
    'Mostra il pannello del Mac a sinistra',
  'To {device}': 'Verso {device}',
  'Use the toggles to enable or disable an item.':
    'Usa gli interruttori per attivare o disattivare un’opzione.',
  'Scroll down for more Settings.':
    'Scorri verso il basso per vedere le altre impostazioni.',
  'To calculate the overall transfer progress, files must be analyzed first. This can take from a few seconds to a few minutes.':
    'Per calcolare l’avanzamento complessivo, i file devono essere analizzati prima. L’operazione può richiedere da pochi secondi ad alcuni minuti.',
  'You can drag files from Finder to the phone pane, but not in the opposite direction.':
    'Puoi trascinare file dal Finder al pannello del telefono, ma non nella direzione opposta.',
  'Automatically check for updates':
    'Controlla automaticamente gli aggiornamenti',
  'Automatically download the new updates when available (recommended)':
    'Scarica automaticamente gli aggiornamenti disponibili (consigliato)',
  'Enable beta update channel': 'Abilita il canale beta',
  'Preview upcoming features. Beta versions may be less stable.':
    'Prova in anteprima le nuove funzioni. Le versioni beta possono essere meno stabili.',
  'Enable anonymous usage statistics gathering':
    'Condividi statistiche anonime di utilizzo',
  'We do not collect personal information or sell your data. Anonymous statistics help improve the app and fix bugs.':
    'Non raccogliamo informazioni personali e non vendiamo i tuoi dati. Le statistiche anonime aiutano a migliorare l’app e correggere i problemi.',
  'Learn more…': 'Scopri di più…',
  Close: 'Chiudi',
  Computer: 'Mac',
  Phone: 'Telefono',
  Home: 'Home',
  Desktop: 'Scrivania',
  Downloads: 'Download',
  'Removable Disks': 'Dischi rimovibili',
  Root: 'Radice',
  'Folder Up': 'Cartella precedente',
  Refresh: 'Aggiorna',
  Delete: 'Elimina',
  Storage: 'Memoria',
  'Help - FAQs': 'Aiuto',
  'Multiple selection': 'Selezione multipla',
  'Finish selection': 'Termina selezione',
  Rename: 'Rinomina',
  Copy: 'Copia',
  'Copy to Queue': 'Aggiungi alla coda',
  Paste: 'Incolla',
  'New Folder': 'Nuova cartella',
  'Open in Finder': 'Mostra nel Finder',
  Favorites: 'Preferiti',
  'Add to Favorites': 'Aggiungi ai preferiti',
  'Remove from Favorites': 'Rimuovi dai preferiti',
  'Favorites are full (max {max})': 'Preferiti pieni (massimo {max})',
  'Right-click a folder and choose Add to Favorites.':
    'Fai clic destro su una cartella e scegli Aggiungi ai preferiti.',
  'Folder not found': 'Cartella non trovata',
  Name: 'Nome',
  Size: 'Dimensione',
  Date: 'Data',
  Type: 'Tipo',
  Sort: 'Ordina',
  'Phone not connected': 'Telefono non collegato',
  'Connect your Android phone': 'Collega il telefono Android',
  'Connection help': 'Guida alla connessione',
  'Check again': 'Controlla di nuovo',
  'Try connection again': 'Riprova la connessione',
  'Checking USB connection…': 'Controllo della connessione USB…',
  'Connecting to your phone…': 'Connessione al telefono in corso…',
  'Keep the phone unlocked. This can take a few seconds.':
    'Tieni il telefono sbloccato: può richiedere qualche secondo.',
  'Loading…': 'Caricamento…',
  'Connect your phone via USB and select File Transfer (MTP) mode.':
    'Collega il tuo smartphone tramite cavo USB e seleziona la modalità Trasferimento File (MTP).',
  'Data-capable USB Cable': 'Cavo USB per Dati',
  'Avoid charge-only USB cables.':
    'Usa un cavo USB che supporti i dati, non un cavo di sola ricarica.',
  'Unlock Screen & Keep Active': 'Sblocca Schermo',
  'Keep the phone screen unlocked.':
    'Sblocca lo smartphone e mantieni lo schermo attivo.',
  'Select File Transfer (MTP)': 'Modalità Trasferimento File (MTP)',
  'Open USB notification on Android.':
    'Dalla notifica USB su Android, seleziona "Trasferimento File".',
  'Allow Access & Try Again': 'Consenti Accesso e Riprova',
  'Accept data permission on Android and retry.':
    'Accetta l’autorizzazione dati sul telefono e premi "Riprova la connessione".',
  'Use a data-capable USB cable, not a charge-only cable.':
    'Usa un cavo USB che supporti i dati, non un cavo di sola ricarica.',
  'Unlock the phone and keep its screen on.':
    'Sblocca il telefono e mantieni lo schermo acceso.',
  'Open the USB notification and choose File transfer / Android Auto.':
    'Apri la notifica USB e scegli Trasferimento file / Android Auto.',
  'Accept Allow access to phone data when Android asks.':
    'Quando Android lo chiede, consenti l’accesso ai dati del telefono.',
  'Then press Try connection again above.':
    'Infine premi Riprova la connessione qui sopra.',
  'If it still fails, disconnect the cable, wait a moment, reconnect it and repeat the steps.':
    'Se ancora non funziona, scollega il cavo, attendi un momento, ricollegalo e ripeti i passaggi.',
  'Connection detail': 'Dettaglio connessione',
  'Another app may already be using the phone USB connection.':
    'Un’altra app potrebbe già utilizzare la connessione USB del telefono.',
  'The USB device disappeared during connection. Check the cable and USB mode on the phone.':
    'Il dispositivo USB è scomparso durante la connessione. Controlla il cavo e la modalità USB sul telefono.',
  'No MTP phone was detected. Check the USB mode and allow data access on Android.':
    'Nessun telefono MTP rilevato. Controlla la modalità USB e consenti ad Android l’accesso ai dati.',
  'Open connection guide': 'Apri la guida completa',
  Connected: 'Collegato',
  'No phone': 'Nessun telefono',
  'Another OpenMTP instance': 'Un’altra istanza di OpenMTP',
  'OpenMTP (development build)': 'OpenMTP (versione di sviluppo)',
  'The phone is in use by: {apps}': 'Il telefono è in uso da: {apps}',
  'Close {app} and try again': 'Chiudi {app} e riprova',
  'Free the phone and try again': 'Libera il telefono e riprova',
  '{app} did not quit. Close it manually, then try again.':
    '{app} non si è chiuso. Chiudilo tu e poi riprova.',
  'No other app is using the phone': 'Nessun’altra app sta usando il telefono',
  'How to connect': 'Come collegarlo',
  Guide: 'Guida',
  'Technical detail': 'Dettaglio tecnico',
  'Made by {name} on GitHub': 'Creato da {name} su GitHub',
  Stars: 'Stelle',
  Forks: 'Fork',
  Repositories: 'Repository',
  Followers: 'Follower',
  'GitHub statistics are unavailable offline':
    'Statistiche GitHub non disponibili offline',
  'Updated {when}': 'Aggiornato {when}',
  Profile: 'Profilo',
  Repository: 'Repository',
  Today: 'Oggi',
  'Last 7 days': 'Ultimi 7 giorni',
  'Last 30 days': 'Ultimi 30 giorni',
  'This year': 'Quest’anno',
  'Language and font': 'Lingua e carattere',
  'How the app talks to you and looks.': 'Come l’app ti parla e come appare.',
  'Light, dark or following macOS.': 'Chiaro, scuro o come macOS.',
  'Follows the macOS appearance.': 'Segue l’aspetto di macOS.',
  'Phone connection': 'Connessione al telefono',
  'How OpenMTP talks to Android phones over USB.':
    'Come OpenMTP comunica con i telefoni Android via USB.',
  'Recommended: faster and more reliable.':
    'Consigliata: più veloce e affidabile.',
  'Older engine, for compatibility.': 'Motore precedente, per compatibilità.',
  'Connects to the phone as soon as you plug in the cable.':
    'Si collega al telefono appena attacchi il cavo.',
  'Files whose name starts with a dot, usually system files.':
    'File il cui nome inizia con un punto, di solito file di sistema.',
  'Large icons in a grid instead of a detailed list.':
    'Icone grandi in griglia invece di un elenco dettagliato.',
  Layout: 'Disposizione',
  'What the file panes show and where.': 'Cosa mostrano i pannelli e dove.',
  'Item counts and selection at the bottom of each pane.':
    'Conteggio degli elementi e selezione in fondo a ogni pannello.',
  'Keep OpenMTP up to date automatically.':
    'Mantieni OpenMTP aggiornato automaticamente.',
  'The phone is not answering yet. If it is locked, unlock it and tap Allow if it asks for access.':
    'Il telefono non risponde ancora. Se è bloccato, sbloccalo e tocca «Consenti» se chiede l’accesso.',
  'Android shows its files only while the phone is unlocked and you have allowed access.':
    'Android mostra i file solo quando il telefono è sbloccato e hai dato il permesso di accesso.',
  'Unlock the phone screen.': 'Sblocca lo schermo del telefono.',
  'If the phone asks “Allow access to phone data?”, tap Allow.':
    'Se il telefono chiede «Consentire l’accesso ai dati del telefono?», tocca Consenti.',
  'Press Try connection again.': 'Premi Riprova la connessione.',
  'The Mac sees the phone, but the phone did not accept the connection. This usually happens when its screen is locked or an access request is waiting on the phone.':
    'Il Mac vede il telefono, ma il telefono non ha accettato la connessione. Di solito succede quando lo schermo è bloccato o c’è una richiesta di accesso in attesa sul telefono.',
  'Unlock the phone and look for an access request: tap Allow.':
    'Sblocca il telefono e cerca la richiesta di accesso: tocca Consenti.',
  'In the USB notification, choose File Transfer.':
    'Nella notifica USB scegli «Trasferimento file».',
  'If it still fails, unplug and reconnect the cable, then press Try connection again.':
    'Se ancora non funziona, scollega e ricollega il cavo, poi premi Riprova la connessione.',
  'The phone is locked': 'Il telefono è bloccato',
  'Unlock the phone screen and, if Android asks, tap Allow to give access to your files. Then try again.':
    'Sblocca lo schermo del telefono e, se Android lo chiede, tocca «Consenti» per dare accesso ai file. Poi riprova.',
  'More than one phone is connected': 'Sono collegati più telefoni',
  'Disconnect the other Android devices and keep only the one you want to use.':
    'Scollega gli altri dispositivi Android e lascia solo quello che vuoi usare.',
  'A different phone was connected': 'È stato collegato un telefono diverso',
  'Try the connection again to open the phone that is plugged in now.':
    'Riprova la connessione per aprire il telefono collegato adesso.',
  'Another operation is still running': 'Un’operazione è ancora in corso',
  'Wait a few seconds for it to finish, then try again.':
    'Attendi qualche secondo che finisca, poi riprova.',
  'Another app is using the phone': 'Un’altra app sta usando il telefono',
  'Close apps that access Android phones (for example Android File Transfer or Smart Switch), then try again.':
    'Chiudi le app che accedono ai telefoni Android (per esempio Android File Transfer o Smart Switch), poi riprova.',
  'No phone in File Transfer mode':
    'Nessun telefono in modalità Trasferimento file',
  'The phone did not respond': 'Il telefono non ha risposto',
  'Unlock the phone, unplug the cable and plug it back in, then choose File Transfer on the phone.':
    'Sblocca il telefono, scollega e ricollega il cavo, poi scegli «Trasferimento file» sul telefono.',
  'The connection did not work': 'La connessione non è riuscita',
  'Unlock the phone, reconnect the cable and try again.':
    'Sblocca il telefono, ricollega il cavo e riprova.',
  'The Mac does not see the phone': 'Il Mac non vede il telefono',
  'Check the cable and choose File Transfer in the USB notification on the phone.':
    'Controlla il cavo e scegli “Trasferimento file” nella notifica USB del telefono.',
  'It is the macOS Photos / Image Capture service: OpenMTP can free the phone for you.':
    'È il servizio di Foto / Acquisizione Immagini di macOS: OpenMTP può liberare il telefono per te.',
  'Close it so OpenMTP can use the phone. It will be asked to quit normally, like with ⌘Q.':
    'Chiudila per permettere a OpenMTP di usare il telefono. Verrà chiusa normalmente, come con ⌘Q.',
  'macOS Image Capture / PTPCamera':
    'Acquisizione Immagini di macOS (ptpcamerad)',
  'Free of': 'liberi su',
  selected: 'selezionati',
  item: 'elemento',
  items: 'elementi',
  folder: 'cartella',
  folders: 'cartelle',
  file: 'file',
  files: 'file',
  'in clipboard': 'negli appunti',
  'item ready': 'elemento pronto',
  'items ready': 'elementi pronti',
  'Transfer here': 'Trasferisci qui',
  'File transfer': 'Trasferimento file',
  'Checking destination': 'Controllo destinazione',
  'Preparing transfer': 'Preparazione trasferimento',
  'Transfer in progress': 'Trasferimento in corso',
  'Transfer completed': 'Trasferimento completato',
  'Transfer failed': 'Trasferimento non riuscito',
  'Transfer steps': 'Fasi del trasferimento',
  'Check destination': 'Controllo destinazione',
  'Prepare files': 'Preparazione file',
  'Transfer files': 'Trasferimento file',
  'Transfer progress': 'Avanzamento trasferimento',
  'Operation active': 'Operazione attiva',
  'Waiting for device response for {count}s':
    'In attesa della risposta del dispositivo da {count} s',
  'Diagnostic ID': 'ID diagnostica',
  'Try again': 'Riprova',
  '{count} items': '{count} elementi',
  '{count} of {total} files': '{count} di {total} file',
  'The transfer could not be completed.':
    'Non è stato possibile completare il trasferimento.',
  'The USB connection was interrupted. Unlock and reconnect the phone, then try again. The transfer queue has been preserved.':
    'La connessione USB si è interrotta. Sblocca e ricollega il telefono, poi riprova. La coda di trasferimento è stata conservata.',
  'Operation in progress. Please wait for the current task to finish.':
    'Operazione in corso. Attendi il completamento del processo prima di avviarne un altro.',
  'Device connection error. Please reconnect the USB cable and try again.':
    'Errore di connessione del dispositivo. Ricollega il cavo USB e riprova.',
  'An error occurred while setting up the Phone':
    'Si è verificato un errore durante la configurazione dello smartphone',
  'An error occurred while setting up the MTP Device':
    'Si è verificato un errore durante la configurazione del dispositivo MTP',
  'No Phone or MTP device found.':
    'Nessuno smartphone o dispositivo MTP rilevato.',
  'Unlock your Phone and refresh again':
    'Sblocca lo smartphone e aggiorna nuovamente',
  'Multiple MTP devices found': 'Rilevati più dispositivi MTP',
  "Accept MTP access to your Phone's storage and refresh again":
    'Consenti l’accesso MTP alla memoria dello smartphone e riprova',
  'An error occurred while fetching the device information':
    'Si è verificato un errore durante il recupero delle informazioni del dispositivo',
  'An error occurred while fetching the storage information':
    'Si è verificato un errore durante il recupero delle informazioni sulla memoria',
  'Your Phone storage is inaccessible.':
    'La memoria dello smartphone non è accessibile.',
  'Phone storage is full': 'La memoria dello smartphone è piena',
  'An error occurred while listing the Phone directory! Try again.':
    'Si è verificato un errore nel caricamento delle cartelle dello smartphone! Riprova.',
  'File not found': 'File non trovato',
  'Operation not permitted': 'Operazione non consentita',
  'The file is inaccessible': 'Il file non è accessibile',
  'Invalid path': 'Percorso non valido',
  'An error occurred while transferring the file! Try again.':
    'Si è verificato un errore durante il trasferimento del file! Riprova.',
  'An error occurred while reading the MTP file object! Try again.':
    'Si è verificato un errore durante la lettura dell’oggetto MTP! Riprova.',
  'An error occurred while sending the object! Try again.':
    'Si è verificato un errore durante l’invio dell’oggetto! Riprova.',
  'An unexpected error occurred. Please try again.':
    'Si è verificato un errore imprevisto. Riprova.',
  'Could not complete! Try again.':
    'Impossibile completare l’operazione. Riprova.',
  "Quit 'Android File Transfer' app (by Google) and Refresh.":
    "Chiudi l'app 'Android File Transfer' (di Google) e aggiorna.",
  'Your Phone is not responding. Reload or reconnect the device.':
    'Lo smartphone non risponde. Ricarica la pagina o ricollega il cavo.',
  'Your Phone storage is not accessible.':
    'La memoria dello smartphone non è accessibile.',
  'Search files and folders': 'Cerca file e cartelle',
  'Waiting for typing to finish': 'Attendo che tu finisca di scrivere\u2026',
  'Current folder': 'Cartella corrente',
  'Clear search': 'Cancella ricerca',
  'Filter by date': 'Filtra per data',
  'Filter by file type': 'Filtra per tipo di file',
  'Filter files by type': 'Filtra i file per tipo',
  'Sorting will remain unchanged':
    'L’ordinamento selezionato non verrà modificato.',
  '{count} file types selected': '{count} tipi di file selezionati',
  '{count} files': '{count} file',
  'Files without extension': 'File senza estensione',
  'No file types in this folder': 'Nessun tipo di file in questa cartella',
  'Date filter active': 'Filtro data attivo',
  'Filter files by date': 'Filtra i file per data',
  'Folders remain visible': 'Le cartelle restano visibili per la navigazione.',
  'Date field': 'Data da usare',
  'Modification date': 'Data di modifica',
  'Creation date': 'Data di creazione',
  'Creation date is unavailable over MTP':
    'Android MTP non fornisce una data di creazione affidabile.',
  'From date': 'Dal',
  'To date': 'Al',
  'Start date must be before end date':
    'La data iniziale deve precedere quella finale.',
  Reset: 'Azzera',
  Cancel: 'Annulla',
  'Apply filter': 'Applica filtro',
  'Sort by {field}': 'Ordina per {field}',
  Search: 'Cerca',
  Searching: 'Ricerca in corso…',
  'Type at least 2 characters': 'Scrivi almeno 2 caratteri',
  '{count} results': '{count} risultati',
  '{count} folders scanned': '{count} cartelle analizzate',
  'No matching files or folders': 'Nessun file o cartella corrispondente',
  'Search stopped at the safety limit':
    'Ricerca fermata al limite di sicurezza',
  'Potential USB conflict detected: {apps}. Quit the listed apps completely, then refresh the connection.':
    'Rilevato un potenziale conflitto USB: {apps}. Chiudi completamente le applicazioni indicate e riaggiorna la connessione.',
  'An error occurred while initializing the device. Unlock the phone and reconnect the USB cable.':
    'Si è verificato un errore durante l’inizializzazione del dispositivo. Sblocca lo smartphone e ricollega il cavo USB.',
};

const dictionaries = {
  [APP_LANGUAGE_TYPE.english]: {},
  [APP_LANGUAGE_TYPE.italian]: italian,
};

export function translate(language, key, values = {}) {
  let targetKey = key;
  let targetValues = values;

  if (
    typeof key === 'string' &&
    key.startsWith('Potential USB conflict detected: ') &&
    key.includes(
      '. Quit the listed apps completely, then refresh the connection.'
    )
  ) {
    const apps = key
      .replace('Potential USB conflict detected: ', '')
      .replace(
        '. Quit the listed apps completely, then refresh the connection.',
        ''
      );

    targetKey =
      'Potential USB conflict detected: {apps}. Quit the listed apps completely, then refresh the connection.';
    targetValues = { apps, ...values };
  }

  const dictionary = dictionaries[language] || dictionaries.en;

  if (targetValues.apps && targetKey !== key) {
    targetValues = {
      ...targetValues,
      apps: String(targetValues.apps)
        .split(', ')
        .map((appName) => dictionary[appName] || appName)
        .join(', '),
    };
  }

  let template = dictionary[targetKey] || targetKey;

  // Fallback for dynamic strings replacing 'Phone' with 'smartphone' in Italian
  if (
    language === APP_LANGUAGE_TYPE.italian &&
    template === key &&
    typeof key === 'string' &&
    key.includes(' Phone ')
  ) {
    const normalizedKey = key.replace(/ Phone /g, ' MTP Device ');

    if (dictionary[normalizedKey]) {
      template = dictionary[normalizedKey];
    }
  }

  return Object.keys(targetValues).reduce(
    (text, name) =>
      text.replace(new RegExp(`\\{${name}\\}`, 'g'), targetValues[name]),
    template
  );
}

export function deviceLabel(language, deviceType) {
  return translate(
    language,
    deviceType === DEVICE_TYPE.local ? 'Computer' : 'Phone'
  );
}

export function getDeviceBrand(manufacturer = '') {
  const normalized = manufacturer.toLowerCase();
  const brands = [
    ['samsung', 'Samsung'],
    ['google', 'Google'],
    ['xiaomi', 'Xiaomi'],
    ['redmi', 'Redmi'],
    ['oneplus', 'OnePlus'],
    ['huawei', 'Huawei'],
    ['motorola', 'Motorola'],
    ['oppo', 'OPPO'],
    ['realme', 'realme'],
    ['sony', 'Sony'],
    ['nothing', 'Nothing'],
  ];
  const match = brands.find(([needle]) => normalized.indexOf(needle) !== -1);

  if (match) {
    return match[1];
  }

  return manufacturer
    .replace(/electronics|corporation|corp\.?|co\.?|ltd\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}
