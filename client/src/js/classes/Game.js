const $ = require("jquery");
const Shape = require("./Shape.js");
const Music = require("./Music.js");
const utils = require("../utils/utils.js");
const socket = require("../utils/socket.js");
const options = require("../utils/options.js");

class Game {
  constructor(mapCtx, previewCtx) {
    this.blockSize = 20;

    this.flavor = sessionStorage.getItem("flavor");

    this.mapCtx = mapCtx;
    this.mapWidth = 10;
    this.mapHeight = 20;
    this.mapBackgroundColor = options.palette[this.flavor].mapBackgroundColor;
    this.map = [...new Array(this.mapHeight)].map(() =>
      new Array(this.mapWidth).fill(0)
    );

    this.previewCtx = previewCtx;
    this.previewWidth = 4;
    this.previewHeight = 2;
    this.previewBackgroundColor =
      options.palette[this.flavor].previewBackgroundColor;
    this.previewMap = [...new Array(this.previewHeight)].map(() =>
      new Array(this.previewWidth).fill(0)
    );

    this.gameMode = sessionStorage.getItem("gameMode") || "single";

    this.gameStart = false;
    this.gamePaused = false;
    this.gameOver = false;

    this.music = new Music();
    this.volumeUp = true;

    this.shape = null;
    this.nextShape = new Shape();
    this.shapeColor = options.palette[this.flavor].shapeColor;

    this.dropTimer = null;
    this.fastForward = false;

    this.level = 1;

    this.score = 0;
    this.highScore = localStorage.getItem("highScore") || 0;

    this.stopIcon = `<span class="material-icons-round !text-sm !leading-3">pause</span>`;
    this.startIcon = `<span class="material-icons-round !text-sm !leading-3">play_arrow</span>`;

    this.volumeOffIcon = `<span class="material-icons-round !text-sm !leading-3">volume_off</span>`;
    this.volumeUpIcon = `<span class="material-icons-round !text-sm !leading-3">volume_up</span>`;

    this.init();
  }

  // 初始化
  init() {
    this.setGameData();
    this.buttonMovePiece();
  }

  // 设置游戏信息
  setGameData() {
    this.drawArea(this.mapCtx, this.map, this.mapBackgroundColor);
    this.drawNextShape();

    $("#score").text(this.score);
    $("#highest-score").text(this.highScore);
    $("#level").text(this.level);
  }

  // 开始游戏
  startGame() {
    this.gameStart = true;
    this.addShape();
    this.setDropTimer();
  }

  // 生成形状
  generateShape() {
    return new Shape();
  }

  // 生成当前方块
  generatePiece() {
    return this.shape.shapeTable[this.shape.shapeType[this.shape.type]][
      this.shape.rotation
    ];
  }

  // 生成下一个方块
  generateNextPiece() {
    return this.nextShape.shapeTable[
      this.nextShape.shapeType[this.nextShape.type]
    ][this.nextShape.rotation];
  }

  // 添加方块
  addShape() {
    this.shape = this.nextShape;
    this.nextShape = this.generateShape();

    this.drawMap();
    this.drawNextShape();

    const piece = this.generatePiece();

    for (let i = 0; i < piece.length; i++) {
      const item = piece[i],
        x = this.shape.xOffset + item[1],
        y = this.shape.yOffset + item[0];

      if (y >= 0 && this.map[y][x]) {
        if (this.dropTimer) {
          clearInterval(this.dropTimer);
          this.dropTimer = null;
        }

        this.gameOver = true;
        this.gameStart = false;
        this.shape = null;
        this.nextShape = null;
        this.overGame();
        break
      }
    }
  }

  // 方块旋转
  rotateShape(rStep) {
    if (!this.gameStart || this.gamePaused || this.gameOver || !this.dropTimer) return;

    const tempRotation = this.shape.rotation;

    this.shape.rotation += rStep;

    const r =
      this.shape.rotation %
      this.shape.shapeTable[this.shape.shapeType[this.shape.type]].length;

    this.shape.rotation = r;

    const piece = this.generatePiece();

    piece.forEach((item) => {
      const x = this.shape.xOffset + item[1],
        y = this.shape.yOffset + item[0];
      if (
        this.map[y] === undefined ||
        this.map[y][x] === undefined ||
        this.map[y][x] > 0
      ) {
        this.shape.rotation = tempRotation;
      }
    });

    this.drawMap();
  }

  // 左移
  moveLeft() {
    this.moveShape(-1, 0);
  }

  // 右移
  moveRight() {
    this.moveShape(1, 0);
  }

  // 下移
  moveDown(enable) {
    if (this.fastForward === enable || (enable && !this.moveShape(0, 1))) return;
    this.fastForward = enable;
    this.setDropTimer();
  }

  // 下坠
  dropShape() {
    if (this.gamePaused || !this.dropTimer) return;
    while (this.moveShape(0, 1)) { }
    this.fallToLand();
  }

  // 移动方块
  moveShape(xStep, yStep) {
    if (!this.gameStart || this.gamePaused || this.gameOver || !this.dropTimer) return;

    const width = this.map[0].length,
      height = this.map.length,
      piece = this.generatePiece();

    let canMove = true;

    piece.forEach((item) => {
      const x = this.shape.xOffset + item[1] + xStep,
        y = this.shape.yOffset + item[0] + yStep;
      if (
        x < 0 ||
        x >= width ||
        y >= height ||
        (this.map[y] && this.map[y][x])
      ) {
        canMove = false;
        return canMove;
      }
    });

    if (canMove) {
      this.shape.xOffset += xStep;
      this.shape.yOffset += yStep;
      this.drawMap();
    }

    return canMove;
  }

  // 设置下落时间
  setDropTimer() {
    let timestep = Math.round(80 + 800 * Math.pow(0.75, this.level - 1));

    timestep = Math.max(10, timestep);

    if (this.fastForward) {
      timestep = 80;
    }

    if (this.dropTimer || this.gamePaused) {
      clearInterval(this.dropTimer);
      this.dropTimer = null;
    }

    if (!this.gamePaused) {
      this.dropTimer = setInterval(() => {
        this.fallToLand();
      }, timestep);
    }
  }

  // 下落至触底
  fallToLand() {
    if (this.moveShape(0, 1)) return;
    this.landShape();
  }

  // 方块触底后将方块合并到地图数组中
  landShape() {
    this.mergeShape()

    const filledRows = this.getFilledRows();

    if (filledRows.length) {
      this.clearFilledRows(filledRows);
    } else {
      this.addShape();
    }
  }

  // 合并方块到地图
  mergeShape() {
    const piece = this.generatePiece();

    piece.forEach((item) => {
      const x = this.shape.xOffset + item[1],
        y = this.shape.yOffset + item[0];
      this.map[y][x] = this.shape.type + 1;
    });
  }

  // 获取满行
  getFilledRows() {
    let filledRows = [];

    this.map.forEach((row, index) => {
      if (row.every((item) => !!item)) {
        filledRows.push(index);
      }
    });

    return filledRows;
  }

  // 消除满行
  clearFilledRows(filledRows) {
    let animationFrame = null, progress = 0;
    const numCols = this.map[0].length;

    if (this.dropTimer) {
      clearInterval(this.dropTimer);
      this.dropTimer = null;
    }

    const animate = () => {
      // 动画结束
      if (progress === numCols) {
        // 停止动画
        cancelAnimationFrame(animationFrame);

        // 删除行
        filledRows.forEach((row) => {
          this.map.splice(row, 1);
          this.map.unshift(new Array(10).fill(0));
        });

        // 更新分数、等级、新方块和重新启动下落计时器
        this.updateScore(filledRows.length);
        this.updateLevel();
        this.addShape();
        this.setDropTimer();

        // 播放音效
        this.music.fetchMusic(0.19, 0.7);

        return
      }

      // 绘制一列小方块
      this.mapCtx.fillStyle = this.shapeColor[7];
      for (let row = 0; row < filledRows.length; row++) {
        const x = progress * this.blockSize, y = filledRows[row] * this.blockSize;
        this.mapCtx.fillRect(x, y, this.blockSize, this.blockSize);
      }

      progress += 0.5;

      // 请求下一帧绘制
      animationFrame = requestAnimationFrame(animate);
    }

    // 开始动画
    animate();
  }

  // 更新分数
  updateScore(filledRows) {
    this.score += filledRows * this.level * 10;
    $("#score").text(this.score);

    if (this.gameMode === "double") {
      socket.emit("updateScore", {
        room: sessionStorage.getItem("room"),
        score: this.score,
      });
    }
  }

  // 更新最高分数
  updateHighScore() {
    if (this.score > this.highScore) {
      localStorage.setItem("highScore", this.score);
    }
  }

  // 更新等级
  updateLevel() {
    const nextLevelScore = (this.level + 1) * 100 * this.level;

    if (this.score >= nextLevelScore) {
      this.level += 1;
      this.updateLevel();
      $("#level").text(this.level);
    }
  }

  // 绘制地图
  drawMap() {
    const mapCtx = this.mapCtx,
      mapBackgroundColor = this.mapBackgroundColor,
      map = this.map,
      piece = this.generatePiece(),
      shapeType = this.shape.type,
      xOffset = this.shape.xOffset,
      yOffset = this.shape.yOffset;

    this.drawArea(mapCtx, map, mapBackgroundColor);
    this.drawShape(mapCtx, piece, shapeType, xOffset, yOffset);
  }

  // 绘制下一个形状
  drawNextShape() {
    const previewCtx = this.previewCtx,
      previewMap = this.previewMap,
      previewBackgroundColor = this.previewBackgroundColor,
      piece = this.generateNextPiece(),
      shapeType = this.nextShape.type;

    this.drawArea(previewCtx, previewMap, previewBackgroundColor);
    this.drawShape(previewCtx, piece, shapeType, 0, 0);
  }

  // 绘制画布区域
  drawArea(ctx, area, backgroundColor) {
    for (let i = 0; i < area.length; i++) {
      for (let j = 0; j < area[i].length; j++) {
        ctx.fillStyle = this.setShapeColor(area[i][j], backgroundColor);
        this.drawBlock(ctx, j, i);
      }
    }
  }

  // 绘制形状
  drawShape(ctx, piece, shapeType, xOffset, yOffset) {
    ctx.fillStyle = this.setShapeColor(shapeType + 1);

    for (let i = 0, length = piece.length; i < length; i++) {
      const x = piece[i][1] + xOffset, y = piece[i][0] + yOffset;

      if (ctx.canvas.id === "map-canvas") {
        this.drawBlock(ctx, x, y);
      } else {
        switch (shapeType) {
          case 0:
            this.drawBlock(ctx, x, y);
            break;
          case 1:
            this.drawBlock(ctx, x, y, 0, 10);
            break;
          default:
            this.drawBlock(ctx, x, y, 10, 0);
            break;
        }
      }
    }
  }

  // 绘制方块
  drawBlock(ctx, x = 1, y = 1, xOffset = 0, yOffset = 0) {
    ctx.fillRect(
      x * this.blockSize + xOffset,
      y * this.blockSize + yOffset,
      this.blockSize,
      this.blockSize
    );
  }

  // 设置游戏颜色主题
  setGamePalette() {
    const flavor = sessionStorage.getItem("flavor"),
      mapBackgroundColor = options.palette[flavor].mapBackgroundColor,
      previewBackgroundColor = options.palette[flavor].previewBackgroundColor,
      shapeColor = options.palette[flavor].shapeColor

    this.mapBackgroundColor = mapBackgroundColor;
    this.previewBackgroundColor = previewBackgroundColor;

    this.shapeColor = shapeColor;

    if (!this.gameStart) {
      this.drawArea(this.mapCtx, this.map, mapBackgroundColor);
    } else {
      this.drawMap()
    }
    this.drawNextShape();
  }

  // 设置颜色
  setShapeColor(type, backgroundColor) {
    const colorIndex = type - 1;
    switch (type) {
      case 0:
        return backgroundColor;
      case 1:
        return this.shapeColor[colorIndex];
      case 2:
        return this.shapeColor[colorIndex];
      case 3:
        return this.shapeColor[colorIndex];
      case 4:
        return this.shapeColor[colorIndex];
      case 5:
        return this.shapeColor[colorIndex];
      case 6:
        return this.shapeColor[colorIndex];
      case 7:
        return this.shapeColor[colorIndex];
    }
  }

  // 结束游戏
  // XXX: again按钮和quit按钮的功能
  overGame() {
    const separatorElement = $(`
      <div class="absolute top-0 left-0 w-full h-full bg-crust bg-opacity-95"></div>
    `);
    const gameOverInfoTemplate = $(`
      <div id="game-over-info"
        class="z-10 flex flex-col justify-around items-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 p-6 border-2 border-text rounded bg-surface0">
        <div id="game-over-title" class="text-4xl font-[Dubtronic]"></div>
        <div id="score-container" class="my-6 text-xs">
          <div>
            <label>YOUR SCORE:</label>
            <span id="your-score-info">${this.score}</span>
          </div>
          <div>
            <label id="another-score-label"></label>
            <span id="another-score-info"></span>
          </div>
          <div>
            <label id="again-label"></label>
            <span id="again-info"></span>
          </div>
        </div>
        <div class="text-xs font-semibold">
          <button id="again-btn" class="w-20 py-1 border-2 border-text rounded" type="button">
            AGAIN
          </button>
          <button id="quit-btn" class="w-20 py-1 border-2 border-text rounded" type="button">
            QUIT
          </button>
        </div>
      </div>
    `).hide();
    $("body").append(separatorElement).append(gameOverInfoTemplate);

    gameOverInfoTemplate.fadeIn("slow");

    if (this.gameMode === "double") {
      socket.emit("gameOver", {
        room: sessionStorage.getItem("room"),
        gameOver: 1,
      });
    } else {
      this.updateHighScore();
      $("#game-over-title").text("GAME OVER")
      $("#another-score-label").text("HIGHEST SCORE:");
      $("#another-score-info").text(this.highScore);

      $("#again-btn").on("touchstart", (e) => {
        e.preventDefault();
        location.reload();
      });
    }

    $("#quit-btn").on("touchstart", (e) => {
      e.preventDefault();
      location.href = "../index.html";
    });
  }

  // 按钮操作
  buttonMovePiece() {
    // 打开菜单
    $("#menu-btn").on("touchstart", (e) => {
      e.preventDefault();

      const separatorElement = $(`
        <div class="fixed top-0 left-0 w-full h-full bg-crust bg-opacity-95"></div>
      `).hide();
      const menuTemplate = $(`
        <aside class="fixed top-0 right-0 w-2/3 h-full p-3 bg-surface0 animate__animated animate__fadeInRight">
          <header class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">OPTIONS</h2>
            <button id="close-btn" class="flex justify-center items-center">
              <span class="material-icons-round !text-2xl !leading-3">close</span>
            </button>
          </header>
          <div class="mt-3">
            <!-- 配色 -->
            <div class="flex justify-start items-center">
              <span class="material-icons-round mr-2 !text-xl">color_lens</span>
              <span class="font-semibold">Paltte</span>
            </div>
            <ul>
              <li class="menu-item flex justify-start items-center ml-6">
                <span class="material-icons-round mr-2 !text-xs !text-surface0">star_rate</span>
                <button class="flavor-btn flex justify-start items-center w-full text-sm">Latte</button>
              </li>
              <li class="menu-item flex justify-start items-center ml-6">
                <span class="material-icons-round mr-2 !text-xs !text-surface0">star_rate</span>
                <button class="flavor-btn flex justify-start items-center w-full text-sm">Frappe</button>
              </li>
              <li class="menu-item flex justify-start items-center ml-6">
                <span class="material-icons-round mr-2 !text-xs !text-surface0">star_rate</span>
                <button class="flavor-btn flex justify-start items-center w-full text-sm">Macchiato</button>
              </li>
              <li class="menu-item flex justify-start items-center ml-6 text-green">
                <span class="material-icons-round mr-2 !text-xs">star_rate</span>
                <button class="flavor-btn flex justify-start items-center w-full text-sm">Mocha</button>
              </li>
            </ul>
          </div>
        </aside>
      `)
      $("body").append(separatorElement).append(menuTemplate);

      separatorElement.fadeIn('fast')

      utils.highlightCurrentOption(".menu-item", "flavor");

      // 关闭菜单
      $("#close-btn").on("touchstart", (e) => {
        e.preventDefault();
        menuTemplate
          .removeClass("animate__fadeInRight")
          .addClass("animate__fadeOutRight")
          .on("animationend", () => {
            separatorElement.fadeOut('fast', () => {
              separatorElement.remove();
            });
            menuTemplate.remove();
          });
      });

      $(".flavor-btn").on("touchstart", (e) => {
        e.preventDefault();
        const flavor = e.currentTarget.innerText.toLowerCase();
        sessionStorage.setItem("flavor", flavor);

        utils.setPagePaltte();
        this.setGamePalette();
        utils.highlightCurrentOption(".menu-item", "flavor");
      });
    });

    // 开始和暂停按钮
    $("#start-btn").on("touchstart", (e) => {
      e.preventDefault();

      if (!this.gameStart) {
        this.gameStart = true;
        utils.changeIcon(
          "start-btn",
          this.gameStart,
          this.stopIcon,
          this.startIcon
        );
        this.startGame();
        return;
      }

      this.gamePaused = !this.gamePaused;

      utils.changeIcon(
        "start-btn",
        !this.gamePaused,
        this.stopIcon,
        this.startIcon
      );

      this.music.fetchMusic(0, 0.19);

      this.setDropTimer();
    });

    // 声音按钮
    $("#volume-btn").on("touchstart", (e) => {
      e.preventDefault();

      this.volumeUp = !this.volumeUp;
      this.music.toggleMute(this.volumeUp);

      utils.changeIcon(
        "volume-btn",
        this.volumeUp,
        this.volumeUpIcon,
        this.volumeOffIcon
      );

      this.music.fetchMusic(0, 0.19);
    });

    // 重新开始
    $("#restart-btn").on("touchstart", (e) => {
      e.preventDefault();
      location.reload();
    });

    // 旋转键
    $("#rotate-btn").on("touchstart", (e) => {
      e.preventDefault();
      this.rotateShape(1);
    });

    // 下落键
    $("#drop-btn").on("touchstart", (e) => {
      e.preventDefault();
      this.dropShape();
    });

    // 左键
    $("#left-btn").on("touchstart", (e) => {
      e.preventDefault();
      this.moveLeft();
    });

    // 右键
    $("#right-btn").on("touchstart", (e) => {
      e.preventDefault();
      this.moveRight();
    });

    // 按下下键
    $("#down-btn").on("touchstart", (e) => {
      e.preventDefault();
      this.moveDown(true);
    });

    // 松开下键
    $("#down-btn").on("touchend", (e) => {
      e.preventDefault();
      this.moveDown(false);
    });

    // 将按钮颜色改为激活状态
    $(".o-btn").on("touchstart", (e) => {
      e.preventDefault();
      this.music.fetchMusic(0, 0.19);
      utils.changeButtonColor(e.currentTarget, "bg-surface0");
    });

    // 将按钮颜色改为背景色
    $(".o-btn").on("touchend", (e) => {
      e.preventDefault();
      utils.changeButtonColor(e.currentTarget, "bg-mantle");
    });
  }
}

module.exports = Game;