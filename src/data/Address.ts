import util from "../utils/util";

const AddressF = {
  toPath: (adr: Address): string => {
    return `${adr.brand}/${adr.area}/${adr.restaurant}/${adr.date}/${adr.shift}`;
  },
  toShiftPath: (adr: Address): string => {
    return `${adr.date}/${adr.shift}`;
  },
  fromPath: (p: string): Address => {
    const sp = p.split("/");
    return {
      brand: sp[0],
      area: sp[1],
      restaurant: sp[2],
      date: sp[3],
      shift: sp[4],
    };
  },

  fromShiftPath: (p: string, adr?: Address): Address => {
    const sp = p.split("/");
    return {
      brand: adr?.brand,
      area: adr?.area,
      restaurant: adr?.restaurant,
      date: sp[0],
      shift: sp[1],
    };
  },
  getDate: (adr: Address): Date => {
    return util.parseYYYYMMDD(adr.date);
  },
  equals: (adr1: Address, adr2: Address): boolean => {
    return (
      adr1.brand === adr2.brand &&
      adr1.area === adr2.area &&
      adr1.restaurant === adr2.restaurant &&
      adr1.date === adr2.date &&
      adr1.shift === adr2.shift
    );
  },
};
export default AddressF;
