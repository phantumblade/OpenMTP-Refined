# dmgbuild settings for the OpenMTP install window (macOS 26 compatible).
# Usage: dmgbuild -s build/dmg/dmgbuild-settings.py -D app=<OpenMTP.app> "OpenMTP <version>" <out.dmg>
import os.path

application = defines.get('app', 'dist/mac-arm64/OpenMTP.app')  # noqa: F821
appname = os.path.basename(application)

format = 'UDZO'
filesystem = 'APFS'
files = [application]
symlinks = {'Applications': '/Applications'}
icon = 'app/app.icns'
icon_locations = {appname: (170, 196), 'Applications': (470, 196)}
background = 'build/dmg/background.tiff'
window_rect = ((200, 200), (640, 400))
default_view = 'icon-view'
show_status_bar = False
show_tab_view = False
show_toolbar = False
show_pathbar = False
show_sidebar = False
icon_size = 100
text_size = 13
