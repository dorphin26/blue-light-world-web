import Phaser from "phaser";
import "./style.css";
import { ManorStudyScene } from "./scenes/ManorStudyScene";
import { journalStore } from "./systems/journalStore";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <main id="game-shell">
    <div id="game-root"></div>
    <div class="hud">
      <div class="brand">푸른빛의 세계 · PROLOGUE v0.1</div>
      <button class="journal-button" id="journal-button" type="button">탐험 일지 (J)</button>
      <section class="panel" id="journal-panel" hidden>
        <h2>탐험 일지</h2>
        <p>저택에서 발견한 정보가 이곳에 기록됩니다.</p>
        <div id="journal-entries"></div>
      </section>
      <div class="help">WASD 이동 · E 조사 · J 일지</div>
    </div>
  </main>
`;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: "#0e1720",
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: "100%",
    height: "100%"
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [ManorStudyScene]
};

new Phaser.Game(config);

const panel = document.querySelector<HTMLElement>("#journal-panel")!;
const button = document.querySelector<HTMLButtonElement>("#journal-button")!;
const entries = document.querySelector<HTMLElement>("#journal-entries")!;

function renderJournal() {
  const items = journalStore.getAll();
  entries.innerHTML = items.length
    ? items.map((entry) => `
      <article class="journal-entry">
        <strong>${entry.title}</strong>
        <div>${entry.body}</div>
      </article>
    `).join("")
    : '<div class="empty">아직 기록된 정보가 없습니다.</div>';
}

function toggleJournal() {
  panel.hidden = !panel.hidden;
  if (!panel.hidden) renderJournal();
}

button.addEventListener("click", toggleJournal);
window.addEventListener("keydown", (event) => {
  if (event.code === "KeyJ") toggleJournal();
});

journalStore.subscribe(renderJournal);
renderJournal();
