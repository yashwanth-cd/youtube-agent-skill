#!/usr/bin/env bash
# One-time setup for a fresh clone: npm packages, Piper TTS and the channel's voice model.
#   bash tools/setup.sh
set -euo pipefail
cd "$(dirname "$0")/.."

npm ci

python3 -m venv tools/.venv
tools/.venv/bin/pip install -q piper-tts numpy

# The channel voice. Its training data is public domain (see channel/characters.md before changing
# it: several Piper voices are non-commercial, which rules them out for a monetised channel).
MODEL=en_US-norman-medium
mkdir -p tools/.models
for f in "$MODEL.onnx" "$MODEL.onnx.json"; do
  [ -s "tools/.models/$f" ] || curl -sSL -o "tools/.models/$f" \
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/norman/medium/$f"
done

# the skills in this repo read the voice profile from here
mkdir -p ~/.claude/youtube && cp channel/voice.md ~/.claude/youtube/voice.md
echo "ready: npm run voice -- videos/<folder>   then   npm run render -- <folder>"
