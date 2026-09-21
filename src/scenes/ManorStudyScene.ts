import Phaser from "phaser";
import { journalStore } from "../systems/journalStore";\nimport { mobileInputStore } from "../systems/mobileInputStore";

type Interactable = {
  id: string;
  label: string;
  x: number;
  y: number;
  description: string;
  journal?: {
    id: string;
    title: string;
    body: string;
  };
};

export class ManorStudyScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Arc;
  private keys!: Record<"up" | "down" | "left" | "right" | "interact", Phaser.Input.Keyboard.Key>;
  private prompt!: Phaser.GameObjects.Text;
  private message!: Phaser.GameObjects.Text;
  private interactables: Interactable[] = [];
  private currentInteractable?: Interactable;
  private readonly speed = 190;

  constructor() {
    super("manor-study");
  }

  create() {
    this.cameras.main.setBackgroundColor("#101922");

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.drawRoom(centerX, centerY);

    this.player = this.add.circle(centerX, centerY + 110, 15, 0xbfdcff);
    this.player.setStrokeStyle(3, 0x4d6e8c);

    this.interactables = [
      {
        id: "map",
        label: "낡은 세계지도",
        x: centerX - 190,
        y: centerY - 100,
        description: "지도 가장자리에 푸른 잉크로 표시된 낯선 산맥이 있다.",
        journal: {
          id: "blue-mark",
          title: "푸른 잉크의 표시",
          body: "저택의 오래된 지도에 북쪽 산맥을 가리키는 푸른 표시가 남아 있다."
        }
      },
      {
        id: "desk",
        label: "아버지의 책상",
        x: centerX + 130,
        y: centerY + 10,
        description: "서랍은 잠겨 있다. 자물쇠에는 오래 긁힌 흔적이 남아 있다.",
        journal: {
          id: "locked-drawer",
          title: "잠긴 서랍",
          body: "아버지의 책상 서랍은 잠겨 있다. 무언가를 숨기려 했던 흔적처럼 보인다."
        }
      },
      {
        id: "books",
        label: "책장",
        x: centerX + 205,
        y: centerY - 120,
        description: "탐험 기록과 지리 서적 사이에서 몇 권의 책만 유독 비어 있다."
      }
    ];

    for (const item of this.interactables) {
      this.add.circle(item.x, item.y, 9, 0x8ebbd4, 0.22);
      this.add.text(item.x, item.y - 28, item.label, {
        fontSize: "12px",
        color: "#a9c7d9"
      }).setOrigin(0.5);
    }

    this.prompt = this.add.text(centerX, centerY + 190, "", {
      fontSize: "14px",
      color: "#eaf4ff",
      backgroundColor: "#101722dd",
      padding: { x: 10, y: 7 }
    }).setOrigin(0.5).setVisible(false);

    this.message = this.add.text(centerX, this.scale.height - 92, "", {
      fontSize: "16px",
      color: "#eaf4ff",
      backgroundColor: "#0a1019ee",
      padding: { x: 16, y: 12 },
      wordWrap: { width: Math.min(620, this.scale.width - 80) },
      align: "center"
    }).setOrigin(0.5).setVisible(false);

    if (!this.input.keyboard) return;

    this.keys = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      interact: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
    };

    this.scale.on("resize", () => {
      this.scene.restart();
    });
  }

  update(_time: number, delta: number) {
    if (!this.keys || !this.player) return;

    const direction = new Phaser.Math.Vector2(
      Number(this.keys.right.isDown) - Number(this.keys.left.isDown),
      Number(this.keys.down.isDown) - Number(this.keys.up.isDown)
    );

    if (direction.lengthSq() > 0) {
      direction.normalize();
      const distance = (this.speed * delta) / 1000;
      this.player.x += direction.x * distance;
      this.player.y += direction.y * distance;
      this.keepPlayerInRoom();
    }

    this.updateInteraction();

    if (Phaser.Input.Keyboard.JustDown(this.keys.interact) && this.currentInteractable) {
      this.interact(this.currentInteractable);
    }
  }

  private drawRoom(cx: number, cy: number) {
    const room = this.add.graphics();

    room.fillStyle(0x162532, 1);
    room.fillPoints([
      new Phaser.Geom.Point(cx, cy - 220),
      new Phaser.Geom.Point(cx + 360, cy - 20),
      new Phaser.Geom.Point(cx, cy + 180),
      new Phaser.Geom.Point(cx - 360, cy - 20)
    ], true);

    room.lineStyle(3, 0x385165, 1);
    room.strokePoints([
      new Phaser.Geom.Point(cx, cy - 220),
      new Phaser.Geom.Point(cx + 360, cy - 20),
      new Phaser.Geom.Point(cx, cy + 180),
      new Phaser.Geom.Point(cx - 360, cy - 20)
    ], true);

    const furniture = this.add.graphics();
    furniture.fillStyle(0x31465a, 1);
    furniture.fillRoundedRect(cx + 70, cy - 5, 120, 54, 8);
    furniture.fillStyle(0x243847, 1);
    furniture.fillRoundedRect(cx - 245, cy - 145, 110, 58, 8);
    furniture.fillRoundedRect(cx + 165, cy - 160, 68, 100, 6);
  }

  private updateInteraction() {
    let nearest: Interactable | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const item of this.interactables) {
      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
      if (distance < 82 && distance < nearestDistance) {
        nearest = item;
        nearestDistance = distance;
      }
    }

    this.currentInteractable = nearest;
    if (nearest) {
      this.prompt.setText(`E · ${nearest.label} 조사`).setPosition(this.player.x, this.player.y - 44).setVisible(true);
    } else {
      this.prompt.setVisible(false);
    }
  }

  private interact(item: Interactable) {
    const added = item.journal ? journalStore.add(item.journal) : false;
    const suffix = added ? "\n새로운 정보가 탐험 일지에 기록되었습니다." : "";

    this.message
      .setText(item.description + suffix)
      .setPosition(this.scale.width / 2, this.scale.height - 92)
      .setVisible(true);

    this.time.delayedCall(3200, () => {
      this.message.setVisible(false);
    });
  }

  private keepPlayerInRoom() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    this.player.x = Phaser.Math.Clamp(this.player.x, cx - 300, cx + 300);
    this.player.y = Phaser.Math.Clamp(this.player.y, cy - 160, cy + 150);
  }
}
