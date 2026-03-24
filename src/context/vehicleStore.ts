import { create } from "zustand";
import { mockVehicles, Vehicle } from "../data/mockVehicles";

type VehicleStore = {
  selectedVehicle: Vehicle;
  setSelectedVehicle: (vehicle: Vehicle) => void;
};

export const useVehicleStore = create<VehicleStore>((set) => ({
  selectedVehicle: mockVehicles[1], // default BMW
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
}));