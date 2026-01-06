import { GoogleGenAI, Type } from "@google/genai";
import { Medicine, SymptomReport, AIAnalysisResult, RegionStats, Supplier, Area, AreaType, IncidentType, ExternalSignals } from '../types';

const DB_KEYS = {
  MEDICINES: 'shlc_medicines',
  REPORTS: 'shlc_reports',
  AREAS: 'shlc_areas',
  SUPPLIERS: 'shlc_suppliers'
};

// --- HIERARCHICAL MOCK DATA ---
const areas: Area[] = [
  { id: 'state-01', name: 'West Province', type: AreaType.STATE, population: 5000000 },
  { id: 'dist-01', name: 'Capital District', type: AreaType.DISTRICT, parentId: 'state-01', population: 2000000 },
  { id: 'dist-02', name: 'Coastal District', type: AreaType.DISTRICT, parentId: 'state-01', population: 1500000 },
  { id: 'city-01', name: 'Metro City', type: AreaType.CITY, parentId: 'dist-01', population: 1200000 },
  { id: 'city-02', name: 'Old Town', type: AreaType.CITY, parentId: 'dist-01', population: 800000 },
  { id: 'city-03', name: 'Port Hub', type: AreaType.CITY, parentId: 'dist-02', population: 900000 },
  { id: 'city-04', name: 'Beach Town', type: AreaType.CITY, parentId: 'dist-02', population: 600000 },
];

const loadFromDB = <T>(key: string, fallback: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const saveToDB = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

let medicines = loadFromDB<Medicine[]>(DB_KEYS.MEDICINES, [
  { id: '1', name: 'Amoxicillin', category: 'Antibiotic', stock: 12000, expiry: '2025-10-01', criticalThreshold: 5000, lastStockUpdate: new Date().toISOString() },
  { id: '2', name: 'Paracetamol', category: 'Analgesic', stock: 50000, expiry: '2026-01-15', criticalThreshold: 10000, lastStockUpdate: new Date().toISOString() },
  { id: '3', name: 'Tamiflu', category: 'Antiviral', stock: 2000, expiry: '2024-12-01', criticalThreshold: 3000, lastStockUpdate: new Date().toISOString() },
  { id: '4', name: 'ORS Packets', category: 'Hydration', stock: 8000, expiry: '2026-05-20', criticalThreshold: 4000, lastStockUpdate: new Date().toISOString() },
]);

let reports = loadFromDB<SymptomReport[]>(DB_KEYS.REPORTS, []);

let suppliersData = loadFromDB<Supplier[]>(DB_KEYS.SUPPLIERS, [
  { id: 'sup-01', name: 'Global Pharma Corp', location: 'Metropolis', capacity: { '1': 1000, '2': 5000 } },
]);

// Simulated external intelligence feeds
const getSimulatedExternalSignals = (incidentType: IncidentType): ExternalSignals => {
  const signals: Record<IncidentType, ExternalSignals> = {
    [IncidentType.GENERAL]: {
      weather: "Seasonal Humidity High (85%)",
      events: ["Annual School Reopening Week"],
      historicalContext: "Historically, 5% uptick in pediatric respiratory cases this week."
    },
    [IncidentType.EMERGENCY]: {
      weather: "Heatwave Alert (42°C+)",
      events: ["Global Sporting Finals (High density)"],
      historicalContext: "High correlation between heatwaves and hydration pack depletion."
    },
    [IncidentType.DISASTER]: {
      weather: "Monsoon Depression / Flash Flood Warning",
      events: ["Evacuation Center Activation"],
      historicalContext: "Flood events typically lead to 300% surge in water-borne disease meds."
    },
    [IncidentType.PANDEMIC]: {
      weather: "Dry Cold Air (Optimal for transmission)",
      events: ["Public Gathering Restrictions"],
      historicalContext: "Viral peaks consistent with current temperature drops."
    }
  };
  return signals[incidentType];
};

export const InventoryService = {
  getAll: async () => medicines,
  updateStock: async (id: string, stock: number) => {
    medicines = medicines.map(m => m.id === id ? { ...m, stock, lastStockUpdate: new Date().toISOString() } : m);
    saveToDB(DB_KEYS.MEDICINES, medicines);
  },
  addMedicine: async (item: Omit<Medicine, 'id' | 'lastStockUpdate'>) => {
    const newItem: Medicine = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      lastStockUpdate: new Date().toISOString()
    };
    medicines.push(newItem);
    saveToDB(DB_KEYS.MEDICINES, medicines);
  }
};

export const CommunityService = {
  getAreas: () => areas,
  submitReport: async (report: Omit<SymptomReport, 'id' | 'timestamp' | 'districtId'>) => {
    const city = areas.find(a => a.id === report.cityId);
    const newReport: SymptomReport = {
      ...report,
      id: Math.random().toString(36).substr(2, 9),
      districtId: city?.parentId || 'unknown',
      timestamp: new Date()
    };
    reports.push(newReport);
    saveToDB(DB_KEYS.REPORTS, reports);
  },
  getRecentReports: async () => reports
};

export const SupplierService = {
  getSuppliers: async () => suppliersData,
  updateCapacity: async (supplierId: string, medicineId: string, capacity: number) => {
    suppliersData = suppliersData.map(s => {
      if (s.id === supplierId) {
        return {
          ...s,
          capacity: { ...s.capacity, [medicineId]: capacity }
        };
      }
      return s;
    });
    saveToDB(DB_KEYS.SUPPLIERS, suppliersData);
  }
};

export const AIService = {
  runHierarchicalAnalysis: async (incidentType: IncidentType = IncidentType.GENERAL): Promise<AIAnalysisResult> => {
    try {
      const externalSignals = getSimulatedExternalSignals(incidentType);
      const inventoryCtx = JSON.stringify(medicines.map(m => ({ name: m.name, stock: m.stock })));
      const reportsCtx = JSON.stringify(reports.map(r => ({ 
        city: areas.find(a => a.id === r.cityId)?.name,
        district: areas.find(a => a.id === r.districtId)?.name,
        symptoms: r.symptoms 
      })));

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = "gemini-3-pro-preview";

      const prompt = `
        You are the Chief Health Forecaster for West Province. 
        STRATEGIC CONTEXT: ${incidentType}
        
        ENHANCED DATA FEEDS:
        - Weather Pattern: ${externalSignals.weather}
        - Local Events: ${externalSignals.events.join(", ")}
        - Historical Outbreak Intelligence: ${externalSignals.historicalContext}
        
        LOGISTICS DATA:
        - Current Inventory: ${inventoryCtx}
        - Community Signals: ${reportsCtx}
        - Regional Hierarchy: ${JSON.stringify(areas)}

        TASK:
        1. Forecast Demand at 3 levels: STATE (West Province), DISTRICTS, and CITIES.
        2. Integrate the "ENHANCED DATA FEEDS" into your calculation. 
           - For example, if weather is "Flash Flood", weight Antibiotics and ORS higher even if reports are low currently.
           - If school is reopening, anticipate pediatric analgesic demand.
        3. Identify the "targetedMedicine" most at risk given these external factors.
        4. Calculate growth rates per area.

        RETURN JSON ONLY.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
              statewideShortTermForecast: { type: Type.INTEGER },
              recommendation: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              scenarioImpact: { type: Type.STRING },
              targetedMedicine: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              hierarchicalForecasts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    areaId: { type: Type.STRING },
                    areaName: { type: Type.STRING },
                    areaType: { type: Type.STRING },
                    predictedDemand: { type: Type.INTEGER },
                    growthRate: { type: Type.NUMBER }
                  },
                  required: ["areaId", "areaName", "areaType", "predictedDemand", "growthRate"]
                }
              }
            },
            required: ["riskLevel", "statewideShortTermForecast", "recommendation", "reasoning", "hierarchicalForecasts", "targetedMedicine", "confidenceScore", "scenarioImpact"]
          }
        }
      });

      const result = JSON.parse(response.text) as AIAnalysisResult;
      return { ...result, externalSignals };

    } catch (e) {
      console.error("Forecasting failure:", e);
      return {
        riskLevel: 'MEDIUM',
        statewideShortTermForecast: 5000,
        recommendation: "Increase buffer stocks in Coastal Districts due to seasonal trends.",
        reasoning: "Heuristic fallback: Insufficient data for high-fidelity granular forecasting.",
        scenarioImpact: "General baseline demand expected.",
        targetedMedicine: "Paracetamol",
        confidenceScore: 0.5,
        hierarchicalForecasts: areas.map(a => ({
          areaId: a.id,
          areaName: a.name,
          areaType: a.type,
          predictedDemand: a.type === AreaType.STATE ? 5000 : 1200,
          growthRate: 0.05
        }))
      };
    }
  }
};