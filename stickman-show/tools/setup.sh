#!/usr/bin/env bash
# One-time setup for a fresh clone or cloud session: npm packages, the voice engines and models.
#   bash tools/setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

npm ci

python3 -m venv tools/.venv
tools/.venv/bin/pip install -q kokoro-onnx soundfile piper-tts numpy

# The channel voice: Kokoro-82M (Apache-2.0 weights, trained only on permissive audio - fine for a
# monetised channel). See channel/characters.md before changing it.
HF=https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main
K=tools/.models/kokoro
mkdir -p "$K/voices"
[ -s "$K/model.onnx" ] || curl -sSL -o "$K/model.onnx" "$HF/onnx/model.onnx"
for v in am_michael am_fenrir am_puck am_adam bm_george bm_fable af_heart af_bella; do
  [ -s "$K/voices/$v.bin" ] || curl -sSL -o "$K/voices/$v.bin" "$HF/voices/$v.bin"
done
tools/.venv/bin/python -I -c "
import glob, os, numpy as np
d = {os.path.basename(f)[:-4]: np.fromfile(f, dtype=np.float32).reshape(-1, 1, 256) for f in glob.glob('$K/voices/*.bin')}
np.savez('$K/voices.npz', **d)
print('kokoro voices:', ', '.join(sorted(d)))"

# Fallback engine (video.json "voice": {"engine": "piper", ...}); public-domain training data.
MODEL=en_US-norman-medium
for f in "$MODEL.onnx" "$MODEL.onnx.json"; do
  [ -s "tools/.models/$f" ] || curl -sSL -o "tools/.models/$f" \
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/norman/medium/$f"
done

# the skills in this repo read the voice profile from here
mkdir -p ~/.claude/youtube && cp channel/voice.md ~/.claude/youtube/voice.md
echo "ready: npm run new-video -- <slug> \"<title>\""
