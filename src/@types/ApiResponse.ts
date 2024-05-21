import { OnlineData, BaseFruits, BaseObstacles, BaseOptions } from "./Map";
import { OnlineMap } from "./db/OnlineMap";

export interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

export interface Pagination {
  pagination: {
    totalItems: number;
    totalPages: number;
    pageSize: number;
    currentPage: number;
  };
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

export interface GetCreatePreviewSuccessResponse
  extends SuccessResponse,
    Pagination {
  data: {
    id: string;
    options: BaseOptions;
    fruits: BaseFruits[];
    obstacles: BaseObstacles[];
  }[];
}

export interface GetAllUploadSuccessResponse
  extends SuccessResponse,
    Pagination {
  data: {
    id: string;

    fruits: BaseFruits[];
    obstacles: BaseObstacles[];
    options: BaseOptions;

    completed?: boolean | undefined;
    completionTime?: Date | null | undefined;
  }[];
}

export interface GetCampaignByIdResponse extends SuccessResponse {
  data: OnlineData;
}

export interface CampaignPreviewResponse extends SuccessResponse {
  data: {
    id: number;
    preview: {
      fruits: BaseFruits[];
      obstacles: BaseObstacles[];
      options: BaseOptions;
    };
    name: string;
    completed: boolean;
  }[];
}
