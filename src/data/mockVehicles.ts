export type Vehicle = {
  id: string;
  name: string;
  plate: string;
  image: any;
};

export const mockVehicles: Vehicle[] = [
  {
    id: "car1",
    name: "2007 Lexus LS430",
    plate: "6CCL122",
    image: require("../../assets/car1.png"),
  },
  {
    id: "car2",
    name: "2014 BMW 328i",
    plate: "6BAK571",
    image: require("../../assets/car2.png"),
  },
];