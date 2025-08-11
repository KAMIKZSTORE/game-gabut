#!/usr/bin/env python3
import sys
import json

try:
    data = json.loads(sys.stdin.read() or '{}')
except Exception:
    data = {}

score = int(data.get('score', 0))

# Logika AI sederhana (contoh) — bisa diperbesar
if score < 50:
    difficulty = "easy"
elif score < 200:
    difficulty = "medium"
else:
    difficulty = "hard"

# contoh respons tambahan: jumlah musuh dan kecepatan
if difficulty == 'easy':
    enemies = 3
    speed = 1.0
elif difficulty == 'medium':
    enemies = 6
    speed = 1.6
else:
    enemies = 10
    speed = 2.3

print(json.dumps({
    "difficulty": difficulty,
    "enemies": enemies,
    "speed": speed
}))
