export enum UserRole {
  ADMIN = 'ADMIN',
  WAREHOUSE = 'WAREHOUSE',
  COMMUNITY = 'COMMUNITY',
  SUPPLIER = 'SUPPLIER'
}

export enum AreaType {
  CITY = 'CITY',
  DISTRICT = 'DISTRICT',
  STATE = 'STATE'
}

export enum IncidentType {
  GENERAL = 'GENERAL',
  EMERGENCY = 'EMERGENCY',
  DISASTER = 'DISASTER',
  PANDEMIC = 'PANDEMIC'
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  expiry: string;
  criticalThreshold: number;
  forecastedDemand?: number;
  lastStockUpdate: string;
}

export interface Area {
  id: string;
  name: string;
  type: AreaType;
  parentId?: string; // City has District ID, District has State ID
  population: number;
}

export interface SymptomReport {
  id: string;
  cityId: string;
  districtId: string;
  symptoms: string[];
  severity: number;
  timestamp: Date;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ExternalSignals {
  weather: string;
  events: string[];
  historicalContext: string;
}

export interface HierarchicalForecast {
  areaId: string;
  areaName: string;
  areaType: AreaType;
  predictedDemand: number;
  growthRate: number;
}

export interface AIAnalysisResult {
  riskLevel: RiskLevel;
  statewideShortTermForecast: number;
  recommendation: string;
  reasoning: string;
  hierarchicalForecasts: HierarchicalForecast[];
  targetedMedicine: string;
  confidenceScore: number;
  scenarioImpact: string;
  externalSignals?: ExternalSignals; // New field for feedback on inputs
}

export interface RegionStats {
  id: string;
  name: string;
  risk: RiskLevel;
  activeCases: number;
  populationDensity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Supplier {
  id: string;
  name: string;
  location: string;
  capacity: Record<string, number>;
}