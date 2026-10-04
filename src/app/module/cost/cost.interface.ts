export type CostPeriod = "day" | "week" | "month" | "year";

export enum CostType {
  Vehicles = "Vehicles",
  Insurance = "Insurance",
  ToolsAndEquipment = "ToolsAndEquipment",
  OfficeAndAdmin = "OfficeAndAdmin",
  FinanceAndBanking = "FinanceAndBanking",
  ProfessionalFees = "ProfessionalFees",
  WorkCoverAndSuper = "WorkCoverAndSuper",
  LicencesAndPermits = "LicencesAndPermits",
  MarketingAndSales = "MarketingAndSales",
  CustomExpenses = "CustomExpenses",
} 
export enum CostSubType {
  PublicLiabilityInsurance = "PublicLiabilityInsurance",
  BusinessInsurance = "BusinessInsurance",
  ToolsAndEquipmentInsurance = "ToolsAndEquipmentInsurance",
  ContractWorksInsurance = "ContractWorksInsurance",
  IncomeProtection = "IncomeProtection",
  ProfessionalIndemnity = "ProfessionalIndemnity",
  HealthInsurance = "HealthInsurance",
  LifeInsurance = "LifeInsurance",
  CyberInsurance = "CyberInsurance",
  CustomInsurance = "CustomInsurance",
} 

export interface ICost {
  userId: string;
  name: string;
  type?: CostType;
  subtype?: CostSubType;
  amount: number;
  period: CostPeriod;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ICreateCost = Omit<ICost, "userId" | "createdAt" | "updatedAt">;