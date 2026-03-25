import { create } from "zustand";
import { Vehicle } from "../data/mockVehicles";

type VehicleStore = {
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
};

export const useVehicleStore = create<VehicleStore>((set) => ({
  selectedVehicle: null,
  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
}));