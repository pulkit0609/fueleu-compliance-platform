// src/core/domain/Route.ts

export type VesselType = 'Container' | 'BulkCarrier' | 'Tanker' | 'RoRo';
export type FuelType = 'HFO' | 'LNG' | 'MGO';

export interface Route {
  id: number;           // internal numeric id
  routeId: string;      // external id like "R001"
  vesselType: VesselType;
  fuelType: FuelType;
  year: number;
  ghgIntensity: number;     // gCO2e/MJ
  fuelConsumption: number;  // tons
  distance: number;         // km
  totalEmissions: number;   // tons
  isBaseline: boolean;
}
