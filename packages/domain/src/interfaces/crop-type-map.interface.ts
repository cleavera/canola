import { CropType } from '../constants/crop-type.constant';

export type ICropTypeMap<T> = {
    [key in CropType]: T;
};
