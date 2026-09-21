import Phaser from "phaser";
import "./style.css";
import { ManorStudyScene } from "./scenes/ManorStudyScene";
import { journalStore } from "./systems/journalStore";
import { mobileInputStore } from "./systems/mobileInputStore";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <main id="viewport-shell">
    <section id="game-shell">
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

        <div class="touch-controls" aria-label="모바일 이동 패드">
          <div class="joystick" id="joystick">
            <div class="joystick-knob" id="joystick-knob"></div>
          </div>
        </div>
      </div>
    </section>
    <div class="rotate-hint">기기를 가로로 돌려 플레이해 주세요.</div>
  </main>
`;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: "#0e1720",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
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
const joystick = document.querySelector<HTMLElement>("#joystick")!;
const knob = document.querySelector<HTMLElement>("#joystick-knob")!;

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

let activePointerId: number | null = null;

function updateJoystick(clientX: number, clientY: number) {
  const rect = joystick.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const maxRadius = rect.width * 0.32;

  let dx = clientX - centerX;
  let dy = clientY - centerY;
  const length = Math.hypot(dx, dy);

  if (length > maxRadius) {
    dx = (dx / length) * maxRadius;
    dy = (dy / length) * maxRadius;
  }

  knob.style.transform = `translate(${dx}px, ${dy}px)`;
  mobileInputStore.set(dx / maxRadius, dy / maxRadius);
}

function resetJoystick() {
  activePointerId = null;
  knob.style.transform = "translate(0px, 0px)";
  mobileInputStore.set(0, 0);
}

joystick.addEventListener("pointerdown", (event) => {
  activePointerId = event.pointerId;
  joystick.setPointerCapture(event.pointerId);
  updateJoystick(event.clientX, event.clientY);
});

joystick.addEventListener("pointermove", (event) => {
  if (event.pointerId !== activePointerId) return;
  updateJoystick(event.clientX, event.clientY);
});

joystick.addEventListener("pointerup", resetJoystick);
joystick.addEventListener("pointercancel", resetJoystick);
