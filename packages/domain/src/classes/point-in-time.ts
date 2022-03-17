import { MONTH_LOOKUP } from '../constants/month-lookup.constant';
import { MONTH_SEASON_LOOKUP } from '../constants/month-season.lookup';
import { SEASON_TICKS_LOOKUP } from '../constants/season-ticks.lookup';
import { Season } from '../constants/season.constant';
import { START_TICK } from '../constants/start-tick.constant';
import * as TicksIn from '../constants/ticks-in.constant';
import { Ticks } from './ticks';

export class PointInTime {
    private static readonly MS_IN_TICK: number = 1000 * 60 * 10;

    public tickNumber: number;

    constructor(tickNumber: number) {
        this.tickNumber = tickNumber;
    }

    private get _absoluteTickNumber(): number {
        return this.tickNumber + START_TICK;
    }

    public get year(): number {
        return Math.floor(this._absoluteTickNumber / TicksIn.YEAR);
    }

    public get month(): number {
        let ticks: number = this._getTicksIntoYear();
        let month: number = 0;

        while ((ticks - TicksIn.MONTH_LOOKUP[month]) > 0) {
            ticks -= TicksIn.MONTH_LOOKUP[month];
            month++;
        }

        return month;
    }

    public get day(): number {
        return Math.floor(this._getTicksIntoMonth() / TicksIn.DAY);
    }

    public get timeOfDay(): number {
        return this._getTicksIntoMonth() % TicksIn.DAY;
    }

    public get season(): Season {
        return PointInTime._getSeason(this.month);
    }

    private _getTicksIntoYear(): number {
        return this._absoluteTickNumber % TicksIn.YEAR;
    }

    private _getTicksIntoMonth(): number {
        let ticks: number = this._getTicksIntoYear();
        let month: number = 0;

        while ((ticks - TicksIn.MONTH_LOOKUP[month]) > 0) {
            ticks -= TicksIn.MONTH_LOOKUP[month];
            month++;
        }

        return ticks;
    }

    public static FromDateString(dateString: string): PointInTime {
        const normalisedDateString: string = this._normaliseDateString(dateString);
        const day: number = this._getDay(normalisedDateString);
        const month: number = this._getMonth(normalisedDateString);
        const year: number = this._getYear(normalisedDateString);
        const timeOfDay: number = this._getTimeOfDay(normalisedDateString, this._getSeason(month));

        let ticks = year * TicksIn.YEAR;

        for (let i = 1; i <= month; i++) {
            ticks += TicksIn.MONTH_LOOKUP[i - 1];
        }

        ticks += day * TicksIn.DAY;
        ticks += timeOfDay;

        return new PointInTime(ticks - START_TICK);
    }

    public static Subtract(pointInTime1: PointInTime, pointInTime2: PointInTime): Ticks {
        return new Ticks(pointInTime1.tickNumber - pointInTime2.tickNumber);
    }

    public static ToDateTime(pointInTime: PointInTime, currentPointInTime: PointInTime): Date {
        const currentDateTime: Date = this._roundDateToNearestTick(new Date(Date.now()));
        const difference: Ticks = PointInTime.Subtract(currentPointInTime, pointInTime);
        const minutesDifference: number = difference.ticks * 10;

        currentDateTime.setMinutes(currentDateTime.getMinutes() - minutesDifference);

        return currentDateTime;
    }

    private static _roundDateToNearestTick(date: Date): Date {
        return new Date(Math.floor(date.getTime() / PointInTime.MS_IN_TICK) * PointInTime.MS_IN_TICK);
    }

    private static _normaliseDateString(dateString: string): string {
        if (dateString.indexOf('Bonfire Night') !== -1 && dateString.indexOf('Midnight')  !== -1) {
            return dateString
                .replace(/Bonfire Night/, 'Unk 6 Nov');
        } else {

            return dateString
                .replace(/Morning time/g, 'Morning')
                .replace(/Mon, 1st Mar/g, 'Mon 1st Mar')
                .replace(/April Fools Day/g, 'Unk 1 Apr')
                .replace(/Valentines Day/g, 'Unk 14 Feb')
                .replace(/Christmas Eve/g, 'Unk 24 Dec')
                .replace(/Christmas Day/g, 'Unk 25 Dec')
                .replace(/Boxing Day/g, 'Unk 26 Dec')
                .replace(/New Years Eve/, 'Unk 31 Dec')
                .replace(/New Years Day/, 'Unk 1 Jan')
                .replace(/Day of Worship/, 'Wed 28th Feb')
                .replace(/International Comma of Angst Day/, 'Unk 4 Aug')
                .replace(/Bonfire Night/, 'Unk 5 Nov')
                .replace(/Halloween/, 'Unk 31 Oct')
                .replace(/year (\d),/, 'year $1.')
                .replace(/st/g, '')
                .replace(/nd/g, '')
                .replace(/rd/g, '')
                .replace(/th/g, '');
        }
    }

    private static _getSeason(month: number): Season {
        return MONTH_SEASON_LOOKUP[month];
    }

    private static _getTimeOfDay(dateString: string, season: Season): number {
        const [, timeOfDayString]: Array<string> = dateString.split('. ');
        const ticks: Array<unknown> = SEASON_TICKS_LOOKUP[season];

        return ticks.indexOf(timeOfDayString.trim());
    }

    private static _getDay(dateString: string): number {
        return parseInt(dateString.split(' ')[1], 10) - 1;
    }

    private static _getMonth(dateString: string): number {
        const [monthPart]: Array<string> = dateString.split(', ');
        const [, , month]: Array<any> = monthPart.split(' '); // eslint-disable-line @typescript-eslint/no-explicit-any

        return MONTH_LOOKUP[month] as unknown as number;
    }

    private static _getYear(dateString: string): number {
        const match: RegExpExecArray | null = (/year (\d+)./).exec(dateString);

        if (match === null) {
            throw new Error(`Invalid date string: ${dateString}`);
        }

        return parseInt(match[1], 10) - 1;
    }
}
