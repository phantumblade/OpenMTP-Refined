import { DEVICE_TYPE } from '../enums';

const folderRules = [
  [/^(\.vscode|vscode)$/i, 'folder_vscode'],
  [/^(xcodeproject|xcode|xcodeproj)$/i, 'folder_xcode'],
  [/^(src|source|sources)$/i, 'folder_src'],
  [/^(script|scripts)$/i, 'folder_scripts'],
  [/^(style|styles|stylesheet|stylesheets)$/i, 'folder_styles'],
  [/^(test|tests|__tests__)$/i, 'folder_tests'],
  [/^(util|utils|utility|utilities)$/i, 'folder_utils'],
  [/^(asset|assets|resources)$/i, 'folder_assets'],
  [/^(config|configs|configuration)$/i, 'folder_config'],
  [/^(core|cores)$/i, 'folder_core'],
  [/^(hook|hooks)$/i, 'folder_hooks'],
  [/^(lib|libs|library|libraries)$/i, 'folder_lib'],
  [/^(node_modules|node)$/i, 'folder_node'],
  [/^(\.github|github)$/i, 'folder_github'],
  [/(photo|foto|image|immagin|raw|edited|editate|lightroom)/i, 'folder_images'],
  [/(video|movie|film|vlog|clip)/i, 'folder_video'],
  [/(download|scaricat)/i, 'folder_download'],
  [/(shared|condivision|condivis)/i, 'folder_shared'],
  [/(document|docs|pdf|libri)/i, 'folder_docs'],
  [/(music|musica|audio)/i, 'folder_audio'],
  [/(android|telefono|phone)/i, 'folder_android'],
  [
    /(application|applicazioni|system|sistema|library|libreria)/i,
    'folder_macos',
  ],
];

const exactFileRules = new Map([
  ['package.json', 'npm'],
  ['package-lock.json', 'npm-lock'],
  ['yarn.lock', 'yarn-lock'],
  ['bun.lock', 'bun-lock'],
  ['bun.lockb', 'bun-lock'],
  ['pyproject.toml', 'python-config'],
  ['requirements.txt', 'python-config'],
  ['dockerfile', 'docker'],
  ['license', 'license'],
  ['license.md', 'license'],
  ['readme', 'readme'],
  ['readme.md', 'readme'],
  ['.gitignore', 'git'],
  ['.gitattributes', 'git'],
  ['.eslintrc', 'eslint'],
  ['.eslintrc.js', 'eslint'],
  ['.eslintrc.json', 'eslint'],
  ['.prettierrc', 'prettier'],
  ['.prettierrc.json', 'prettier'],
  ['babel.config.js', 'javascript'],
  ['webpack.config.js', 'webpack'],
]);

const extensionRules = [
  [/jpe?g$/, 'image'],
  [/dng$/, 'dng'],
  [
    /(png|gif|webp|bmp|heic|heif|tiff?|arw|cr2|nef|orf|rw2|pef|raf|psd)$/,
    'image',
  ],
  [/(mp4|m4v|mov|webm|avi|mkv|mxf)$/, 'video'],
  [/(mp3|aac|wav|flac|m4a|ogg|wma)$/, 'audio'],
  [/pdf$/, 'pdf'],
  [/(py|pyw|pyi)$/, 'python'],
  [/ipynb$/, 'jupyter'],
  [/(sh|bash|zsh|fish|ksh|csh|awk)$/, 'bash'],
  [/(js|mjs|cjs)$/, 'javascript'],
  [/(jsx)$/, 'javascript-react'],
  [/(ts|mts|cts)$/, 'typescript'],
  [/(json|jsonc)$/, 'json'],
  [/(html|htm)$/, 'html'],
  [/css$/, 'css'],
  [/(scss|sass)$/, 'sass'],
  [/(md|mdx)$/, 'markdown'],
  [/(yaml|yml)$/, 'yaml'],
  [/xml$/, 'xml'],
  [/(toml|ini|conf|cfg)$/, 'config'],
  [/(txt|text)$/, 'text'],
  [/(log|out)$/, 'log'],
  [/csv$/, 'csv'],
  [/(zip|rar|7z|tar|gz|bz2|xz)$/, 'zip'],
  [/(db|sqlite|sqlite3|sql)$/, 'database'],
  [/(c)$/, 'c'],
  [/(h)$/, 'c-header'],
  [/(cc|cpp|cxx)$/, 'cpp'],
  [/(hh|hpp|hxx)$/, 'cpp-header'],
  [/java$/, 'java'],
  [/(kt|kts)$/, 'kotlin'],
  [/swift$/, 'swift'],
  [/go$/, 'go'],
  [/rs$/, 'rust'],
  [/rb$/, 'ruby'],
  [/(woff2?|ttf|otf|eot)$/, 'font'],
  [/svg$/, 'svg'],
  [/(env)$/, 'env'],
  [/(lock|bak)$/, 'lock'],
];

function iconTheme(appThemeMode) {
  return appThemeMode === 'dark' ? 'mocha' : 'latte';
}

export function getFolderIcon({
  item,
  deviceType,
  currentBrowsePath,
  appThemeMode,
}) {
  const theme = iconTheme(appThemeMode);
  const currentPath = currentBrowsePath?.[deviceType];

  if (deviceType === DEVICE_TYPE.local && item.path === '/Volumes') {
    return `catppuccin/${theme}/volumes.svg`;
  }

  if (deviceType === DEVICE_TYPE.local && currentPath === '/Volumes') {
    return `catppuccin/${theme}/volume.svg`;
  }

  const folderRule = folderRules.find(([pattern]) => pattern.test(item.name));
  const icon = folderRule ? folderRule[1] : '_folder';

  return `catppuccin/${theme}/${icon}.svg`;
}

export function isLocalImage(item, deviceType) {
  return (
    deviceType === DEVICE_TYPE.local &&
    /\.(jpe?g|png|gif|webp|bmp|heic|heif|tiff?|dng|arw|cr2|nef|orf|rw2|pef|raf|psd)$/i.test(
      item.name
    )
  );
}

export function getFileCategory(item) {
  if (item.isFolder) {
    return { id: 'folders', label: 'Cartelle', icon: '📁', order: 1 };
  }

  const name = item.name.toLowerCase();
  const ext = name.includes('.') ? name.split('.').pop() : '';

  if (
    /^(jpe?g|png|gif|webp|bmp|heic|heif|tiff?|dng|arw|cr2|nef|orf|rw2|pef|raf|psd|svg)$/i.test(
      ext
    )
  ) {
    return { id: 'images', label: 'Immagini & RAW', icon: '🖼️', order: 2 };
  }

  if (/^(mp4|m4v|mov|webm|avi|mkv|mxf|flv|wmv|3gp)$/i.test(ext)) {
    return { id: 'videos', label: 'Video', icon: '🎬', order: 3 };
  }

  if (/^(mp3|aac|wav|flac|m4a|ogg|wma|aiff)$/i.test(ext)) {
    return { id: 'audio', label: 'Audio & Musica', icon: '🎵', order: 4 };
  }

  if (
    /^(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf|pages|numbers|key)$/i.test(ext)
  ) {
    return { id: 'documents', label: 'Documenti', icon: '📄', order: 5 };
  }

  if (/^(zip|rar|7z|tar|gz|bz2|xz|iso|dmg)$/i.test(ext)) {
    return { id: 'archives', label: 'Archivi', icon: '📦', order: 6 };
  }

  if (
    /^(py|js|jsx|ts|tsx|html|css|json|cpp|c|h|java|kt|swift|sh|rs|go|php|rb|sql)$/i.test(
      ext
    )
  ) {
    return { id: 'code', label: 'Codice & Script', icon: '💻', order: 7 };
  }

  return { id: 'other', label: 'Altri File', icon: '📎', order: 8 };
}

export function isLocalVideo(item, deviceType) {
  return (
    deviceType === DEVICE_TYPE.local &&
    /\.(mp4|m4v|mov|webm|avi|mkv)$/i.test(item.name)
  );
}

export function getFileIcon(item, appThemeMode) {
  const theme = iconTheme(appThemeMode);
  const name = item.name.toLowerCase();
  const extension = name.includes('.') ? name.split('.').pop() : '';
  const extensionRule = extensionRules.find(([pattern]) =>
    pattern.test(extension)
  );
  const semanticNameIcon =
    /^config/.test(name) || /(^|\.)\w*rc(\.|$)/.test(name) ? 'config' : null;
  const icon =
    exactFileRules.get(name) ||
    semanticNameIcon ||
    extensionRule?.[1] ||
    '_file';

  return `catppuccin/${theme}/${icon}.svg`;
}
