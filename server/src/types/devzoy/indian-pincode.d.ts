declare module "@devzoy/indian-pincode" {
  export interface PincodeOffice {
    pincode: string;
    office: string;
    district: string;
    state: string;
    latitude?: number;
    longitude?: number;
    distance?: number;
  }

  export interface PincodeAPI {
    validate(pincode: string): boolean;
    lookup(pincode: string): Promise<PincodeOffice[]>;
    findNearby(latitude: number, longitude: number, radiusKm: number): Promise<PincodeOffice[]>;
    searchByDistrict(district: string): Promise<PincodeOffice[]>;
  }

  export const pincode: PincodeAPI;
  export default pincode;
}
