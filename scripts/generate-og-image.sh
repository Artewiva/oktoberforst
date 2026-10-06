#!/usr/bin/env bash
#
# Rigenera l'immagine di anteprima social (Open Graph, 1200x630) del sito
# Festa Della Birra Palermo 2026, partendo dalla foto dell'hero.
#
#   bash scripts/generate-og-image.sh
#
# Output: public/images/og-festa-della-birra-palermo-2026.jpg
#
# Requisiti: ImageMagick (`convert`) e python3.
# Il font Oswald usato sui titoli viene scaricato e registrato al volo; se non
# è disponibile, lo script ripiega sui font di sistema DejaVu Sans.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

SRC="public/images/hero-festival.jpg"
LOGO="public/images/LOGO FESTA DELLA BIRRA 2026.png"
OUT="public/images/og-festa-della-birra-palermo-2026.jpg"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

W=1200; H=630
AMBER="#d4a329"; DARK="10,27,18"

# --- Font ---------------------------------------------------------------
FONT_BOLD="Oswald-Bold"; FONT_MED="Oswald-Medium"
if ! convert -list font 2>/dev/null | grep -q "Font: Oswald-Bold"; then
  mkdir -p "$WORK/fonts"
  if command -v gh >/dev/null 2>&1; then
    gh api "repos/google/fonts/contents/ofl/oswald/Oswald%5Bwght%5D.ttf" \
      --jq '.content' 2>/dev/null | base64 -d > "$WORK/fonts/Oswald.ttf" || true
  else
    curl -fsSL "https://raw.githubusercontent.com/google/fonts/main/ofl/oswald/Oswald%5Bwght%5D.ttf" \
      -o "$WORK/fonts/Oswald.ttf" 2>/dev/null || true
  fi
  if [ -s "$WORK/fonts/Oswald.ttf" ]; then
    mkdir -p "$HOME/.fonts"
    cp "$WORK/fonts/Oswald.ttf" "$HOME/.fonts/Oswald.ttf"
    command -v fc-cache >/dev/null 2>&1 && fc-cache -f >/dev/null 2>&1 || true
  fi
fi
if ! convert -list font 2>/dev/null | grep -q "Font: Oswald-Bold"; then
  FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
  FONT_MED="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
  echo "!! Oswald non disponibile: uso DejaVu Sans" >&2
fi

# --- 1. Sfondo: foto hero 1200x630 con velo scuro sfumato ---------------
python3 - "$SRC" "$WORK/bg.raw" "$W" "$H" "$DARK" <<'PY'
import subprocess, sys
src, dst, W, H, dark = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), \
    tuple(int(c) for c in sys.argv[5].split(','))
raw = subprocess.run(["convert", src, "-resize", f"{W}x{H}^", "-gravity", "center",
                      "-extent", f"{W}x{H}", "-depth", "8", "rgb:-"],
                     check=True, capture_output=True).stdout
assert len(raw) == W * H * 3, len(raw)


def smooth(t):
    u = min(1.0, max(0.0, t))
    return u * u * (3 - 2 * u)


out = bytearray(W * H * 3)
for y in range(H):
    row = y * W * 3
    for x in range(W):
        a = 0.26                                                # velo globale
        a = 1 - (1 - a) * (1 - 0.62 * smooth(1 - x / 980))       # sfumatura da sinistra
        a = 1 - (1 - a) * (1 - 0.42 * smooth((y - 300) / 300))   # piede piu' scuro
        a = 1 - (1 - a) * (1 - 0.30 * smooth(1 - y / 230))       # testata piu' scura
        i = row + x * 3
        for c in range(3):
            out[i + c] = round(raw[i + c] * (1 - a) + dark[c] * a)
open(dst, "wb").write(out)
PY
convert -size "${W}x${H}" -depth 8 "rgb:$WORK/bg.raw" "$WORK/bg.png"

# --- 2. Pastiglia del logo ufficiale ------------------------------------
convert "$LOGO" -resize 280x280 -background none -gravity center -extent 280x280 "$WORK/logo_sq.png"
convert -size 280x280 xc:none -fill white -draw "circle 140,140 140,2" "$WORK/logo_mask.png"
convert "$WORK/logo_sq.png" "$WORK/logo_mask.png" -alpha off -compose CopyOpacity -composite "$WORK/logo.png"
convert -size 296x296 xc:none -stroke "$AMBER" -strokewidth 7 -fill none -draw "circle 148,148 148,6" "$WORK/logo_ring.png"
convert "$WORK/logo.png" -background none -gravity center -extent 296x296 "$WORK/logo_ring.png" \
  -compose over -composite "$WORK/logo_badge.png"
convert -size 460x460 radial-gradient:"rgba(212,163,41,0.32)-rgba(212,163,41,0)" "$WORK/logo_glow.png"

# --- 3. Composizione finale ---------------------------------------------
BAND=104; BAND_Y=$((H - BAND))

convert "$WORK/bg.png" \
  "$WORK/logo_glow.png" -gravity east -geometry +54-6 -compose over -composite \
  "$WORK/logo_badge.png" -gravity east -geometry +100-20 -compose over -composite \
  -fill "rgba(15,35,25,0.78)" -draw "rectangle 0,$BAND_Y $((W-1)),$((H-1))" \
  -fill "$AMBER" -draw "rectangle 0,$BAND_Y $((W-1)),$((BAND_Y+3))" \
  -font "$FONT_BOLD" \
  -fill "$AMBER" -pointsize 23 -kerning 3 -gravity northwest -annotate +88+96 'PALERMO · 15—18 OTTOBRE 2026' \
  -fill white    -pointsize 100 -kerning -2 -gravity northwest -annotate +84+142 'FESTA DELLA' \
  -fill "$AMBER" -pointsize 100 -kerning -2 -gravity northwest -annotate +82+242 'BIRRA' \
  -fill 'rgba(255,255,255,0.86)' -pointsize 25 -kerning 1 \
  -gravity northwest -annotate +90+356 'Forst alla spina, concerti' \
  -gravity northwest -annotate +90+394 'e gastronomia bavarese' \
  -font "$FONT_BOLD" -fill "$AMBER" -pointsize 27 -kerning 3 \
  -gravity northwest -annotate +88+$((BAND_Y+38)) 'INGRESSO LIBERO' \
  -fill 'rgba(255,255,255,0.82)' -pointsize 25 -kerning 2 \
  -gravity northeast -annotate +88+$((BAND_Y+39)) 'PARCO VILLA FILIPPINA' \
  "$WORK/og.png"

convert "$WORK/og.png" -strip -interlace Plane -sampling-factor 4:2:0 -quality 88 "$OUT"
identify "$OUT"
