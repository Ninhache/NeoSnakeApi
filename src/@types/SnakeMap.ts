export type Coordinates = {
  x: number;
  y: number;
};

export type DirectionType = "Up" | "Down" | "Left" | "Right";

export type foodType = "FBa" | "FBi";
export type obstacleType = "OBa" | "ODi";
export type gameObjectType = foodType | obstacleType;

export interface SnakeMapData {
  options: {
    width: 800;
    height: 800;
    cellSize: number;
    name: string;
  };
  snake: {
    startPosition: Coordinates;
    direction: DirectionType;
    length: number | 3;
  };
  gameObject: {
    x: number;
    y: number;
    type: gameObjectType;
  }[];
}

export interface NextFrameInfo {
  snakeHasMoved: boolean;
}

export type SnakeMapType = "LOADED" | "LOADING" | "ERROR";
