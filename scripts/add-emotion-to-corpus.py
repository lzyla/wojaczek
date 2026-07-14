import json, os

poems_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'analyses', 'poems')
corpus_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'analyses', 'corpus.json')

with open(corpus_path, 'r', encoding='utf-8') as f:
    corpus = json.load(f)

emotion_list = []

for entry in corpus.get('poemIndex', []):
    pid = entry['id']
    poem_path = os.path.join(poems_dir, f'{pid}.json')
    if os.path.exists(poem_path):
        with open(poem_path, 'r', encoding='utf-8') as f:
            d = json.load(f)
        ai = d.get('aiAnalysis', {})
        emotion = ai.get('emotion')
        wc = d.get('wordCount', 0)
        emotion_list.append({
            'id': pid,
            'title': entry['title'],
            'wordCount': wc,
            'emotion': emotion,
        })
    else:
        emotion_list.append({'id': pid, 'title': entry['title'], 'wordCount': 0, 'emotion': None})

corpus['emotionPerPoem'] = emotion_list

with open(corpus_path, 'w', encoding='utf-8') as f:
    json.dump(corpus, f, ensure_ascii=False, indent=2)

print(f'Added {len(emotion_list)} poems with emotion data to corpus.json')
print(f'With emotion: {sum(1 for e in emotion_list if e["emotion"])}')
