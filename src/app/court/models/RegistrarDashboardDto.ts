export interface RegistrarDashboardDto {
    todayIncome: number;
    weekIncome: number;
    monthIncome: number;
    totalIncome: number;
    todaySignedAff: number;
    weekSignedAff: number;
    monthSignedAff: number;
    totalSignedAff: number;
  }

export interface RegistrarDashboardResponse {
    success?: boolean;
    statusCode?: string;
    total?: number;
    data: RegistrarDashboardDto;
  }