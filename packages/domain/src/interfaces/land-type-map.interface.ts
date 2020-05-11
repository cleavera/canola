import { LandType } from '../constants/land-type.constant';

export type ILandTypeMap<T> = {
    [key in LandType]: T;
};
