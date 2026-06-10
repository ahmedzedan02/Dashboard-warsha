import { axiosInstance } from '@/shared/lib/axiosInstance';
import type {
  CreateSupportAgentRequestDto,
  CreateSupportAgentResponseDto,
  LoginRequestDto,
  LoginResponseEnvelopeDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from '@/modules/auth/types/auth';

const normalizeLoginResponse = (payload: LoginResponseEnvelopeDto | LoginResponseDto): LoginResponseDto => {
  const nestedData = 'data' in payload ? payload.data : undefined;
  const nestedGeneralData = 'generalData' in payload && payload.generalData && 'accessToken' in payload.generalData ? payload.generalData : undefined;
  const authPayload = nestedData ?? nestedGeneralData;

  return {
    code: 'code' in payload ? payload.code : undefined,
    statusCode: 'statusCode' in payload ? payload.statusCode : undefined,
    isSuccess: payload.isSuccess ?? ('success' in payload ? payload.success ?? false : false),
    message: payload.message,
    accessToken: authPayload?.accessToken ?? ('accessToken' in payload ? payload.accessToken : undefined),
    refreshToken: authPayload?.refreshToken ?? ('refreshToken' in payload ? payload.refreshToken : undefined),
    expiration: authPayload?.expiration ?? ('expiration' in payload ? payload.expiration : undefined),
    generalData:
      authPayload?.generalData ??
      ('generalData' in payload && payload.generalData && !('accessToken' in payload.generalData) ? payload.generalData : undefined),
  };
};

export const loginAdmin = async (payload: LoginRequestDto): Promise<LoginResponseDto> => {
  const response = await axiosInstance.post<LoginResponseEnvelopeDto | LoginResponseDto>('/api/AdminApp/AuthAdmin/Login', payload, {
    headers: { Authorization: undefined },
  });
  return normalizeLoginResponse(response.data);
};

export const refreshToken = async (payload: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> => {
  const response = await axiosInstance.post<LoginResponseEnvelopeDto | RefreshTokenResponseDto>('/api/AdminApp/AuthAdmin/refresh-token', payload, {
    headers: { Authorization: undefined },
  });
  return normalizeLoginResponse(response.data);
};

export const createSupportAgent = async (payload: CreateSupportAgentRequestDto): Promise<CreateSupportAgentResponseDto> => {
  const response = await axiosInstance.post<CreateSupportAgentResponseDto>('/api/AdminApp/AuthAdmin/CreateSupportAgent', payload);
  return response.data;
};
