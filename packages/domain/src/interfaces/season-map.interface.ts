import { Season } from '../constants/season.constant';

export type ISeasonMap<T> = {
    [key in Season]: T;
};
