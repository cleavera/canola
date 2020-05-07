import { AFTERNOON, DAWN, DUSK, EARLY_HOURS, EVENING, MIDNIGHT, MORNING, NOON } from './times-of-day.constant';

export const TICK_ORDER_SUMMER: Array<string> = [
    EARLY_HOURS,
    DAWN,
    MORNING,
    NOON,
    AFTERNOON,
    EVENING
];

export const TICK_ORDER_WINTER: Array<string> = [
    MIDNIGHT,
    EARLY_HOURS,
    MORNING,
    AFTERNOON,
    DUSK,
    EVENING
];

export const TICK_ORDER_SPRING: Array<string> = [
    MIDNIGHT,
    EARLY_HOURS,
    MORNING,
    NOON,
    AFTERNOON,
    EVENING
];

export const TICK_ORDER_AUTUMN: Array<string> = TICK_ORDER_SPRING;
