import client from "./client";

export interface Vehicle {
  color: string;
  created_at: string;
  id: string;
  make: string;
  model: string;
  nickname: null | string;
  plate: string;
  user_id: string;
  year: string;
}

export interface CreateVehiclePayload {
  color: string;
  make: string;
  model: string;
  nickname?: string;
  plate: string;
  year: string;
}

export const fetchVehicles = async (): Promise<Vehicle[]> => {
  const res = await client.get<{ vehicles: Vehicle[] }>("/vehicles");
  return res.data.vehicles;
};

export const createVehicle = async (payload: CreateVehiclePayload): Promise<Vehicle> => {
  const res = await client.post<Vehicle>("/vehicles", payload);
  return res.data;
};

export const updateVehicle = async (id: string, payload: Partial<CreateVehiclePayload>): Promise<Vehicle> => {
  const res = await client.patch<Vehicle>(`/vehicles/${id}`, payload);
  return res.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  await client.delete(`/vehicles/${id}`);
};
