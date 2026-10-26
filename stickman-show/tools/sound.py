"""Synthesise the music bed and sound effects, so the video ships with no licensed audio.

    python3 tools/sound.py   # writes public/sfx/*.wav and public/music/lofi-loop.wav

These are shared by every video. Re-running it is deterministic (fixed seed).
"""

import wave
from pathlib import Path

import numpy as np

RATE = 44100
OUT = Path(__file__).resolve().parent.parent / "public"
rng = np.random.default_rng(7)


def write(path, x):
    x = np.clip(x / (np.max(np.abs(x)) + 1e-9) * 0.9, -1, 1)
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def t(sec):
    return np.arange(int(sec * RATE)) / RATE


def env(n, attack, release):
    e = np.ones(n)
    a, r = int(attack * RATE), int(release * RATE)
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r) ** 2
    return e


def pop():
    x = t(0.12)
    f = 900 * np.exp(-x * 30) + 300
    return np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-x * 40)


def whoosh():
    x = t(0.45)
    noise = rng.standard_normal(len(x))
    # crude band-pass sweep: moving average whose width shrinks as the sweep rises
    out = np.zeros_like(noise)
    for i, w in enumerate(np.linspace(40, 6, 12)):
        seg = slice(i * len(x) // 12, (i + 1) * len(x) // 12)
        out[seg] = np.convolve(noise, np.ones(int(w)) / w, "same")[seg]
    return out * np.sin(np.pi * x / x[-1]) ** 2


def ding():
    x = t(1.2)
    tone = sum(a * np.sin(2 * np.pi * f * x) * np.exp(-x * d)
               for f, a, d in [(1318.5, 1, 3), (2637, 0.4, 5), (1975.5, 0.3, 4), (3951, 0.15, 8)])
    coin = np.concatenate([np.zeros(int(0.06 * RATE)), tone[:-int(0.06 * RATE)]])
    return tone * 0.6 + coin * 0.6


def thud():
    x = t(0.35)
    f = 120 * np.exp(-x * 12) + 45
    body = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-x * 14)
    click = rng.standard_normal(len(x)) * np.exp(-x * 120) * 0.4
    return body + click


def tick():
    x = t(0.05)
    return rng.standard_normal(len(x)) * np.exp(-x * 160) + np.sin(2 * np.pi * 2500 * x) * np.exp(-x * 90)


def pluck(freq, sec):
    """Karplus-Strong string."""
    n, p = int(sec * RATE), int(RATE / freq)
    buf = rng.uniform(-1, 1, p)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out


def music():
    bpm, beats_per_chord = 84, 8
    beat = 60 / bpm
    # Cmaj7 - Am7 - Fmaj7 - G6, voiced low and soft
    chords = [[48, 55, 59, 64], [45, 52, 55, 60], [41, 48, 52, 57], [43, 50, 52, 59]]
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    bar = beat * beats_per_chord
    total = np.zeros(int(bar * len(chords) * RATE) + RATE)
    for ci, chord in enumerate(chords):
        start = int(ci * bar * RATE)
        x = t(bar + 0.6)
        pad = sum(np.sin(2 * np.pi * hz(m) * x) + 0.5 * np.sin(2 * np.pi * hz(m) * 1.003 * x)
                  for m in chord) * env(len(x), 0.8, 0.9) * 0.08
        total[start:start + len(x)] += pad[: len(total) - start]
        bass = np.sin(2 * np.pi * hz(chord[0] - 12) * x) * env(len(x), 0.05, 1.2) * 0.25
        total[start:start + len(x)] += bass[: len(total) - start]
        pattern = [0, 2, 1, 3, 2, 1, 3, 2]
        for b in range(beats_per_chord * 2):
            note = chord[pattern[b % 8]] + 12
            s = start + int(b * beat / 2 * RATE)
            p = pluck(hz(note), 1.0) * 0.12 * (1 if b % 2 == 0 else 0.7)
            total[s:s + len(p)] += p[: len(total) - s]
    loop_len = int(bar * len(chords) * RATE)
    # fold the ring-out back to the top so the loop is seamless
    total[: len(total) - loop_len] += total[loop_len:]
    return total[:loop_len]


if __name__ == "__main__":
    for name, fn in [("pop", pop), ("whoosh", whoosh), ("ding", ding), ("thud", thud), ("tick", tick)]:
        write(OUT / "sfx" / f"{name}.wav", fn())
    write(OUT / "music" / "lofi-loop.wav", music())
    print("ok")
