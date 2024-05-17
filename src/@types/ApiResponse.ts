import { OnlineMap } from "./OnlineMap";
import {
  ScenarioData,
  ScenarioFruits,
  ScenarioObstacles,
  ScenarioOptions,
} from "./SnakeMap";

export interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

export interface SuccessResponse extends ApiResponse {
  success: true;
}

export interface ErrorResponse extends ApiResponse {
  success: false;
}

export interface LoginSuccessResponse extends SuccessResponse {
  accessToken: string;
  refreshToken: string;
  username: string;
}

export interface SignupSuccessResponse extends SuccessResponse {
  message: string;
}

export interface RefreshSuccessResponse extends SuccessResponse {
  accessToken: string;
}

export interface LevelsaveSuccessResponse extends SuccessResponse {
  message: string;
}

export interface GetOnlineMapByIdSuccessResponse extends SuccessResponse {
  data: OnlineMap;
}

export interface GetCreatePreviewSuccessResponse extends SuccessResponse {
  data: {
    id: string;
    options: ScenarioOptions;
    fruits: ScenarioFruits[];
    obstacles: ScenarioObstacles[];
  }[];
}

export interface GetAllUploadSuccessResponse extends SuccessResponse {
  data: {
    id: string;
    preview: {
      fruits: ScenarioFruits[];
      obstacles: ScenarioObstacles[];
      options: ScenarioOptions;
    };

    completed?: boolean | undefined;
    completionTime?: Date | null | undefined;
  }[];
}

export interface GetDefaultMapsByIdResponse extends SuccessResponse {
  data: ScenarioData;
}

export interface DefaultMapsPreviewResponse extends SuccessResponse {
  data: {
    id: string;
    preview: {
      fruits: ScenarioFruits[];
      obstacles: ScenarioObstacles[];
      options: ScenarioOptions;
    };
    name: string;
    completed: boolean;
  }[];
}
