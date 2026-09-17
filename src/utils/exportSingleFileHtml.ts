import { ListeningLesson, VocabularyItem } from '../types';

export function generateSingleFileHtml(
  vocabulary: VocabularyItem[],
  lessons: ListeningLesson[]
): string {
  const jsonVocab = JSON.stringify(vocabulary).replace(/</g, '\\u003c');
  const jsonLessons = JSON.stringify(lessons).replace(/</g, '\\u003c');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>English Listening Practice Lab - 100% Offline Single File</title>
  <style>
    :root {
      --primary: #2563eb;
      --primary-hover: #1d4ed8;
      --text: #0f172a;
      --text-muted: #64748b;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --border: #e2e8f0;
      --radius: 16px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    body { background-color: var(--bg); color: var(--text); line-height: 1.6; padding-bottom: 60px; }
    header { background: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 50; }
    .nav-container { max-width: 1200px; margin: 0 auto; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; }
    .brand { font-size: 1.2rem; font-weight: 800; color: #1e293b; display: flex; align-items: center; gap: 8px; }
    .tabs { display: flex; gap: 6px; background: #f1f5f9; padding: 4px; border-radius: 12px; }
    .tab-btn { border: none; background: transparent; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; color: #475569; cursor: pointer; transition: all 0.2s; }
    .tab-btn.active { background: #fff; color: var(--primary); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .main-content { max-width: 1200px; margin: 24px auto; padding: 0 20px; }
    .card { background: var(--card-bg); border-radius: var(--radius); border: 1px solid var(--border); padding: 24px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
    .btn { background: var(--primary); color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
    .btn:hover { background: var(--primary-hover); }
    .btn-outline { background: transparent; color: var(--primary); border: 1px solid var(--primary); }
    .btn-outline:hover { background: #eff6ff; }
    .player-box { background: #0f172a; color: #fff; border-radius: 20px; padding: 24px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
    .badge-blue { background: #eff6ff; color: #1d4ed8; }
    .badge-green { background: #ecfdf5; color: #047857; }
    .badge-amber { background: #fffbeb; color: #b45309; }
    .timeline { width: 100%; margin: 16px 0; accent-color: var(--primary); }
    .controls { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .word-chip { display: inline-block; padding: 8px 16px; border-radius: 10px; border: 1px solid var(--border); font-size: 0.85rem; font-weight: 700; cursor: pointer; margin: 4px; background: #fff; }
    .word-chip.selected { background: var(--primary); color: #fff; border-color: var(--primary); }
    .word-chip.correct { background: #dcfce7; color: #15803d; border-color: #86efac; }
    .word-chip.missed { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
  </style>
</head>
<body>
  <header>
    <div class="nav-container">
      <div class="brand">🎧 ELT Listening Lab</div>
      <div class="tabs">
        <button class="tab-btn" onclick="setTab('vocab')">VOCABULARY</button>
        <button class="tab-btn active" onclick="setTab('lab')">LISTENING LAB</button>
        <button class="tab-btn" onclick="setTab('words')">MY WORDS</button>
      </div>
    </div>
  </header>

  <main class="main-content" id="app">
    <!-- Rendered via JavaScript for 100% offline reactivity -->
  </main>

  <script>
    const INITIAL_VOCAB = ${jsonVocab};
    const INITIAL_LESSONS = ${jsonLessons};

    let vocabulary = JSON.parse(localStorage.getItem('elt_vocab') || 'null') || INITIAL_VOCAB;
    let lessons = INITIAL_LESSONS;
    let currentTab = 'lab';
    let activeLessonId = null;
    let activeStage = 'listen';
    let isPlaying = false;
    let currentTime = 0;
    let playbackSpeed = 1.0;
    let selectedWords = [];
    let huntSubmitted = false;

    function saveState() {
      localStorage.setItem('elt_vocab', JSON.stringify(vocabulary));
    }

    function setTab(tab) {
      currentTab = tab;
      activeLessonId = null;
      document.querySelectorAll('.tab-btn').forEach((b, i) => {
        b.classList.toggle('active', ['vocab', 'lab', 'words'][i] === tab);
      });
      render();
    }

    function speak(text, accent = 'British English', rate = 1.0) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = rate;
        u.lang = accent.includes('American') ? 'en-US' : (accent.includes('Australian') ? 'en-AU' : 'en-GB');
        window.speechSynthesis.speak(u);
      }
    }

    function startLesson(id) {
      activeLessonId = id;
      activeStage = 'listen';
      selectedWords = [];
      huntSubmitted = false;
      render();
    }

    function render() {
      const app = document.getElementById('app');
      if (activeLessonId) {
        renderLessonView(app);
        return;
      }
      if (currentTab === 'lab') renderLabView(app);
      else if (currentTab === 'vocab') renderVocabView(app);
      else if (currentTab === 'words') renderMyWordsView(app);
    }

    function renderLabView(app) {
      let html = '<h1 style="font-size: 1.8rem; margin-bottom: 8px;">Authentic Listening Library</h1>';
      html += '<p style="color: var(--text-muted); margin-bottom: 24px;">Organised by topics for secondary and high-school students.</p>';
      html += '<div class="grid">';
      lessons.forEach(l => {
        html += '<div class="card">';
        html += '<span class="badge badge-blue">' + l.topic + '</span> <span class="badge badge-green">CEFR ' + l.cefr + '</span>';
        html += '<h3 style="margin: 12px 0 6px; font-size: 1.2rem;">' + l.title + '</h3>';
        html += '<p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">' + l.learningObjective + '</p>';
        html += '<div style="margin-bottom: 16px;"><small style="font-weight:700;">Target vocabulary:</small><br/>';
        l.targetWords.forEach(w => {
          html += '<span class="badge badge-blue" style="margin: 2px;">' + w + '</span>';
        });
        html += '</div>';
        html += '<button class="btn" style="width:100%; justify-content:center;" onclick="startLesson(\\'' + l.id + '\\')">▶ START LISTENING</button>';
        html += '</div>';
      });
      html += '</div>';
      app.innerHTML = html;
    }

    function renderLessonView(app) {
      const l = lessons.find(x => x.id === activeLessonId);
      if (!l) return;
      let html = '<button class="btn btn-outline" style="margin-bottom: 16px;" onclick="setTab(\\'lab\\')">← Back to Library</button>';
      html += '<div class="player-box">';
      html += '<div style="display:flex; justify-content:space-between; margin-bottom: 12px;">';
      html += '<div><strong>' + l.title + '</strong> <span class="badge badge-blue">' + l.accent + '</span></div>';
      html += '<div>' + l.duration + '</div>';
      html += '</div>';
      html += '<div class="controls">';
      html += '<button class="btn" onclick="speak(\\'' + l.fullTranscriptText.replace(/'/g, "\\\\'") + '\\', \\'' + l.accent + '\\')">▶ Listen Full Audio</button>';
      html += '<button class="btn btn-outline" style="color:#fff; border-color:#fff;" onclick="window.speechSynthesis.cancel()">⏹ Stop</button>';
      html += '</div>';
      html += '</div>';

      html += '<div class="card">';
      html += '<h2>STAGE 2: WORD HUNT</h2>';
      html += '<p style="color: var(--text-muted); margin: 8px 0 16px;">Which words did you hear? Tap the words below:</p>';
      l.wordHunt.options.forEach(opt => {
        const sel = selectedWords.includes(opt.word);
        let cls = 'word-chip' + (sel ? ' selected' : '');
        if (huntSubmitted) {
          if (opt.isTarget && sel) cls += ' correct';
          else if (opt.isTarget && !sel) cls += ' missed';
        }
        html += '<span class="' + cls + '" onclick="toggleWord(\\'' + opt.word + '\\')">' + opt.word + '</span>';
      });

      if (!huntSubmitted) {
        html += '<div style="margin-top: 16px;"><button class="btn" onclick="submitHunt()">Submit Word Hunt</button></div>';
      } else {
        html += '<div style="margin-top: 16px; padding: 12px; background: #ecfdf5; border-radius: 8px; color: #065f46;"><strong>✓ Saved to My Words:</strong> Missed words have been added for audio review.</div>';
      }
      html += '</div>';

      app.innerHTML = html;
    }

    function toggleWord(w) {
      if (huntSubmitted) return;
      if (selectedWords.includes(w)) selectedWords = selectedWords.filter(x => x !== w);
      else selectedWords.push(w);
      render();
    }

    function submitHunt() {
      huntSubmitted = true;
      const l = lessons.find(x => x.id === activeLessonId);
      l.targetWords.forEach(tw => {
        const item = vocabulary.find(v => v.word.toLowerCase() === tw.toLowerCase());
        if (item) {
          if (selectedWords.includes(tw)) {
            item.stats.listeningRecognised = true;
          } else {
            item.stats.listeningRecognised = false;
            item.stats.timesMissedListening++;
          }
        }
      });
      saveState();
      render();
    }

    function renderVocabView(app) {
      let html = '<h1 style="font-size: 1.8rem; margin-bottom: 8px;">Vocabulary Knowledge Base</h1>';
      html += '<div class="grid">';
      vocabulary.forEach(v => {
        html += '<div class="card">';
        html += '<div style="display:flex; justify-content:space-between; align-items:center;"><h3>' + v.word + '</h3><span class="badge badge-blue">' + v.cefr + '</span></div>';
        html += '<p style="font-size:0.85rem; color:var(--text-muted); margin: 6px 0;">' + v.definition + '</p>';
        html += '<button class="btn btn-outline" style="margin-top:8px;" onclick="speak(\\'' + v.word + '\\')">🔊 Pronounce</button>';
        html += '</div>';
      });
      html += '</div>';
      app.innerHTML = html;
    }

    function renderMyWordsView(app) {
      let html = '<h1 style="font-size: 1.8rem; margin-bottom: 8px;">My Words & Recognition Tracker</h1>';
      const missing = vocabulary.filter(v => !v.stats.listeningRecognised);
      html += '<div class="card" style="border-color:#fcd34d; background:#fffbeb;">';
      html += '<h3 style="color:#b45309;">WORDS I KEEP MISSING (' + missing.length + ')</h3>';
      html += '<p style="font-size:0.85rem; color:#92400e;">Words you struggled to recognize in speech:</p>';
      html += '<div style="margin-top:12px;">';
      missing.forEach(m => {
        html += '<span class="badge badge-amber" style="font-size:0.9rem; margin:4px;">' + m.word + ' (Missed ' + m.stats.timesMissedListening + 'x)</span>';
      });
      html += '</div>';
      html += '</div>';
      app.innerHTML = html;
    }

    render();
  </script>
</body>
</html>`;
}

export function downloadStandaloneHtmlFile(
  vocabulary: VocabularyItem[],
  lessons: ListeningLesson[]
) {
  const content = generateSingleFileHtml(vocabulary, lessons);
  const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'elt-listening-practice-lab.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
