import { create } from "zustand";

export type Vehicle = {
  id: string;
  name: string;
  plate: string;
  image?: string;
  make: string;
  model: string;
  year: string;
  color: string;
};

type VehicleStore = {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  addVehicle: (vehicle: Vehicle) => void;
  removeVehicle: (vehicleId: string) => void;
};

export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicles: [],
  selectedVehicle: null,

  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  addVehicle: (vehicle) =>
    set((state) => ({
      vehicles: [...state.vehicles, vehicle],
    })),

  removeVehicle: (vehicleId) =>
    set((state) => ({
      vehicles: state.vehicles.filter((vehicle) => vehicle.id !== vehicleId),
      selectedVehicle:
        state.selectedVehicle?.id === vehicleId ? null : state.selectedVehicle,
    })),
}));