"""Lay the dashboard frames out as one image per film frame (film/assets/ui/seq/s_0001.jpg = film frame 0), holding the
first and last UI frames outside the dashboard's own 330 frames.   python3 tools/link_ui.py"""
import os
UI_START, UI_FRAMES, TOTAL = 420, 150, 960
d = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'film', 'assets', 'ui')
os.makedirs(os.path.join(d, 'seq'), exist_ok=True)
for f in range(TOTAL):
    k = min(UI_FRAMES, max(1, f - UI_START + 1))
    dst = os.path.join(d, 'seq', f's_{f + 1:04d}.jpg')
    if os.path.lexists(dst):
        os.remove(dst)
    os.symlink(os.path.join('..', f'ui_{k:04d}.jpg'), dst)
print('linked', TOTAL)
