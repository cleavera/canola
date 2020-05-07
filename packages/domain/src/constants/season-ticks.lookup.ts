import { Season } from './season.constant';
import { TICK_ORDER_AUTUMN, TICK_ORDER_SPRING, TICK_ORDER_SUMMER, TICK_ORDER_WINTER } from './tick-order.constant';

export const SEASON_TICKS_LOOKUP = {
    [Season.WINTER]: TICK_ORDER_WINTER,
    [Season.SPRING]: TICK_ORDER_SPRING,
    [Season.SUMMER]: TICK_ORDER_SUMMER,
    [Season.AUTUMN]: TICK_ORDER_AUTUMN
};
