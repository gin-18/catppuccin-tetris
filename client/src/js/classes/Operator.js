const utils = require("../utils.js");

class Operator {
  constructor(game, music) {
    this.game = game;
    this.music = music;
    this.stopIcon = `<span class="material-icons-round !text-sm !leading-3">pause</span>`;
    this.startIcon = `<span class="material-icons-round !text-sm !leading-3">play_arrow</span>`;

    this.volumeOff = `<span class="material-icons-round !text-sm !leading-3">volume_off</span>`;
    this.volumeUp = `<span class="material-icons-round !text-sm !leading-3">volume_up</span>`;
  }

  // 按钮操作
  buttomMovePiece() {
    // 打开菜单
    document.getElementById("menu-btn").addEventListener("click", () => {
      document.getElementById("menu").classList.replace("hidden", "block");
    });

    // 关闭菜单
    document.getElementById("close-btn").addEventListener("click", () => {
      document.getElementById("menu").classList.replace("block", "hidden");
    });

    // 开始和暂停按钮
    document.getElementById("start-btn").addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (!this.game.gameStart) {
        this.game.gameStart = true;
        utils.changeIcon(
          "start-btn",
          this.game.gameStart,
          this.stopIcon,
          this.startIcon
        );

        this.game.startGame();

        return;
      }

      this.game.gamePaused = !this.game.gamePaused;

      utils.changeIcon(
        "start-btn",
        !this.game.gamePaused,
        this.stopIcon,
        this.startIcon
      );

      if (this.game.volumeUp) {
        this.music.audioSource.button();
      }

      this.game.setDropTimer();
    });

    // 声音按钮
    document
      .getElementById("volume-btn")
      .addEventListener("touchstart", (e) => {
        e.preventDefault();

        this.game.volumeUp = !this.game.volumeUp;

        utils.changeIcon(
          "volume-btn",
          this.game.volumeUp,
          this.volumeUp,
          this.volumeOff
        );
      });

    // 重新开始
    document
      .getElementById("restart-btn")
      .addEventListener("touchstart", (e) => {
        e.preventDefault();

        location.reload();
      });

    // 旋转键
    document
      .getElementById("rotate-btn")
      .addEventListener("touchstart", (e) => {
        e.preventDefault();

        this.game.rotateShape(1);

        if (this.game.volumeUp) {
          this.music.audioSource.button();
        }

        utils.changeButtonColor(e.currentTarget, "bg-surface0");
      });

    // 下落键
    document.getElementById("drop-btn").addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.game.dropShape();

      if (this.game.volumeUp) {
        this.music.audioSource.button();
      }

      utils.changeButtonColor(e.currentTarget, "bg-surface0");
    });

    // 左键
    document.getElementById("left-btn").addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.game.moveLeft();

      if (this.game.volumeUp) {
        this.music.audioSource.button();
      }

      utils.changeButtonColor(e.currentTarget, "bg-surface0");
    });

    // 右键
    document.getElementById("right-btn").addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.game.moveRight();

      if (this.game.volumeUp) {
        this.music.audioSource.button();
      }

      utils.changeButtonColor(e.currentTarget, "bg-surface0");
    });

    // 按下下键
    document.getElementById("down-btn").addEventListener("touchstart", (e) => {
      e.preventDefault();
      this.game.moveDown(true);

      if (this.game.volumeUp) {
        this.music.audioSource.button();
      }

      utils.changeButtonColor(e.currentTarget, "bg-surface0");
    });

    // 松开下键
    document.getElementById("down-btn").addEventListener("touchend", (e) => {
      e.preventDefault();
      this.game.moveDown(false);
    });

    // 将按钮颜色改为背景色
    document.querySelectorAll(".o-btn").forEach((item) => {
      item.addEventListener("touchend", (e) => {
        console.log(e.currentTarget);
        utils.changeButtonColor(e.currentTarget, "bg-mantle");
      });
    });
  }

  // 键盘操作
  keyMovePiece() {
    document.body.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyS":
          if (!this.game.gameStart) {
            this.game.startGame();
            this.game.gameStart = true;
          }
          break;
        case "KeyP":
          if (id) {
            this.game.gamePaused = !this.game.gamePaused;
            this.game.setDropTimer();
          }
          this.gameLoop();
          break;
        case "KeyK":
          this.game.rotateShape(1);
          break;
        case "KeyH":
          this.game.moveLeft();
          break;
        case "KeyL":
          this.game.moveRight();
          break;
        case "KeyJ":
          this.game.moveDown(true);
          break;
        case "Space":
          this.game.dropShape();
          break;
      }
    });

    document.body.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "KeyJ":
          this.game.moveDown(false);
          break;
      }
    });
  }
}

module.exports = Operator;