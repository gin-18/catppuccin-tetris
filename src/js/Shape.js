class Shape {
  constructor(type, x, y) {
    this.shapeTable = {
      O: [
        [
          [0, 1, 1, 0],
          [0, 1, 1, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
      ],
      I: [
        [
          [2, 2, 2, 2],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 2, 0, 0],
          [0, 2, 0, 0],
          [0, 2, 0, 0],
          [0, 2, 0, 0],
        ],
      ],
      S: [
        [
          [0, 3, 3, 0],
          [3, 3, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [3, 0, 0, 0],
          [3, 3, 0, 0],
          [0, 3, 0, 0],
          [0, 0, 0, 0],
        ],
      ],
      Z: [
        [
          [4, 4, 0, 0],
          [0, 4, 4, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 4, 0, 0],
          [4, 4, 0, 0],
          [4, 0, 0, 0],
          [0, 0, 0, 0],
        ],
      ],
      T: [
        [
          [5, 5, 5, 0],
          [0, 5, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 5, 0, 0],
          [5, 5, 0, 0],
          [0, 5, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 5, 0, 0],
          [5, 5, 5, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 5, 0, 0],
          [0, 5, 5, 0],
          [0, 5, 0, 0],
          [0, 0, 0, 0],
        ],
      ],
      L: [
        [
          [0, 0, 6, 0],
          [6, 6, 6, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 6, 0, 0],
          [0, 6, 0, 0],
          [0, 6, 6, 0],
          [0, 0, 0, 0],
        ],
        [
          [6, 6, 6, 0],
          [6, 0, 0, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [6, 6, 0, 0],
          [0, 6, 0, 0],
          [0, 6, 0, 0],
          [0, 0, 0, 0],
        ],
      ],
      J: [
        [
          [7, 0, 0, 0],
          [7, 7, 7, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 7, 7, 0],
          [0, 7, 0, 0],
          [0, 7, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [7, 7, 7, 0],
          [0, 0, 7, 0],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 7, 0, 0],
          [0, 7, 0, 0],
          [7, 7, 0, 0],
          [0, 0, 0, 0],
        ],
      ],
    };
    this.shapeType = ["O", "I", "S", "Z", "T", "L", "J"];
    this.type = type;
    this.rotation = 0;
    this.xOffset =  x || 3;
    this.yOffset = y || 0;
    this.blocks = []
  }
}

module.exports = Shape;