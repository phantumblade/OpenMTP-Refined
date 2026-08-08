import { APP_LANGUAGE_TYPE, DEVICE_TYPE } from '../enums';

const italian = {
  Settings: 'Impostazioni',
  General: 'Generali',
  'File Manager': 'Gestione file',
  Updates: 'Aggiornamenti',
  Privacy: 'Privacy',
  Language: 'Lingua',
  English: 'Inglese',
  Italian: 'Italiano',
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
  'No known conflicting apps are currently running':
    'Non risultano aperte app note che interferiscono con la connessione',
  'Potential conflicts currently running: {apps}':
    'Possibili app in conflitto attualmente aperte: {apps}',
  'Quit the listed apps completely. OpenMTP never closes other apps automatically.':
    'Chiudi completamente le app indicate. OpenMTP non chiude mai altre applicazioni automaticamente.',
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
