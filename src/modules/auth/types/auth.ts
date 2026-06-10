import type { SupportResponseDto } from '@/shared/types/common';

export interface LoginRequestDto {
  username: string;
  password: string;
}

export interface MainAdminScreen {
  screenName: string;
}

export interface AuthGeneralData {
  id: number;
  adminname: string;
  adminusername: string;
  adminactive: boolean;
  usertype: 'admin' | 'support' | null;
  provider_type_id: number | null;
  maintadminType: string | null;
  mainadminScreens: MainAdminScreen[] | null;
}

export interface LoginPayloadDto {
  generalData: AuthGeneralData;
  accessToken: string;
  refreshToken: string;
  expiration: string;
}

export interface LoginResponseDto {
  code?: number;
  statusCode?: number;
  isSuccess: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  expiration?: string;
  generalData?: AuthGeneralData;
}

export interface RefreshTokenRequestDto {
  accessToken: string;
  refreshToken: string;
}

export interface CreateSupportAgentRequestDto {
  adminName: string;
  adminUsername: string;
  adminPassword: string;
  isActive: boolean;
}

export interface LoginResponseEnvelopeDto {
  code?: number;
  statusCode?: number;
  success?: boolean;
  isSuccess?: boolean;
  message: string;
  data?: LoginPayloadDto;
  generalData?: LoginPayloadDto;
}

export type RefreshTokenResponseDto = LoginResponseDto;
export type CreateSupportAgentResponseDto = SupportResponseDto<{
  id: number;
  adminName: string;
  adminUsername: string;
  isActive: boolean;
  userType: string;
}>;
