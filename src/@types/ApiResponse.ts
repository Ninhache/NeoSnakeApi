export interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

export interface ErrorResponse extends ApiResponse {
  success: false;
}

export interface LoginSuccessResponse extends ApiResponse {
  success: true;
  statusCode: number;
  accessToken: string;
  refreshToken: string;
  username: string;
}

export interface SignupSuccessResponse extends ApiResponse {
  success: true;
  statusCode: number;
  message: string;
}

export interface RefreshSuccessResponse extends ApiResponse {
  success: true;
  accessToken: string;
}

export interface LevelsaveSuccessResponse extends ApiResponse {
  success: true;
  statusCode: number;
  message: string;
}
