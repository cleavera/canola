import { IDomElement, IRequest } from '@actoolkit/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { Acres } from '../classes/acres';
import { CompanyName } from '../classes/company-name';
import { DriveByReport } from '../classes/drive-by-report';
import { HackReport } from '../classes/hack-report';
import { Land } from '../classes/land';
import { Plants } from '../classes/plants';
import { Seeds } from '../classes/seeds';
import { Staff } from '../classes/staff';
import { Stocks } from '../classes/stocks';
import { UnitStats } from '../classes/unit-stats';
import { Units } from '../classes/units';
import { Workforce } from '../classes/workforce';
import { CropType } from '../constants/crop-type.constant';
import { getRequestService } from '../helpers/get-request-service.helper';
import { ICropTypeMap } from '../interfaces/crop-type-map.interface';
import { UnitsRepository } from './units.repository';

export class IntelRepository {
    private static readonly ACRES_FILLED_SPLIT_PATTERN: string = ' of ';
    private readonly _unitsRepository: UnitsRepository;
    private _units: Maybe<Units>;

    constructor() {
        this._unitsRepository = new UnitsRepository();
        this._units = null;
    }

    public async driveBy(target: CompanyName): Promise<DriveByReport> {
        const request: IRequest = getRequestService();

        await request.post('/actions/intelligence_2.php', {
            drive_by: '1',
            fly_over: '1',
            haxor: '0',
            spy: '0'
        });

        const response: IDomElement = await request.post('/intelligence.php', {
            CK: await this._getIntelCkValue(),
            IntelType: 'Drive',
            Target: target.id
        });

        const tableElements: ArrayLike<IDomElement> = response.querySelectorAll('#main-page-data > table');

        return this.parseDriveBy(tableElements[0], tableElements[1]);
    }

    public async parseDriveBy(targetTable: IDomElement, driveByReportTable: IDomElement): Promise<DriveByReport> {
        const targetName: string = targetTable.textContent ?? this._throwNotValidIntelPage();
        const target: CompanyName = CompanyName.FromString(targetName.trim());
        const rows: ArrayLike<IDomElement> = driveByReportTable.querySelectorAll('tr');

        const land: Land = this._parseLand(rows[2], rows[3], rows[4], rows[5]);
        const plants: Plants = this._parsePlants(rows[8], rows[9], rows[10], rows[11]);
        const seeds: Seeds = this._parseSeeds(rows[14], rows[15], rows[16], rows[17]);

        return new DriveByReport(target, land, new Stocks(seeds, plants));
    }

    public async parseHackReport(hackReportTable: IDomElement): Promise<HackReport> {
        const staff: Array<Promise<Staff>> = [];

        const rows: ArrayLike<IDomElement> = hackReportTable.querySelectorAll('tr');
        const targetNameElement: IDomElement = rows[0].querySelector('span');
        const targetName: string = targetNameElement.textContent ?? this._throwNotValidIntelPage();
        const target: CompanyName = CompanyName.FromString(targetName.trim());

        for (let x = 2; x < rows.length; x++) {
            const cells: ArrayLike<IDomElement> = rows[x].querySelectorAll('td');

            for (let y = 0; y < cells.length - 1; y += 2) { // Skip last cell if there is an odd number of cells
                staff.push(this._getStaff(cells[y], cells[y + 1]));
            }
        }

        const workforce: Workforce = new Workforce(await Promise.all(staff));

        return new HackReport(target, workforce);
    }

    private async _getIntelCkValue(): Promise<string> {
        const request: IRequest = getRequestService();
        const response: IDomElement = await request.get('/intelligence.php');

        const ckField: IDomElement = response.querySelector('#main-page-data form[action="intelligence.php"] input[name=CK i]');

        return ckField.getAttribute('value') ?? this._throwNoIntelCKValue();
    }

    private _parseSeeds(treeRow: IDomElement, bushRow: IDomElement, flowerRow: IDomElement, grassRow: IDomElement): Seeds {
        return new Seeds(
            this._parseNumber(this._getValueString(treeRow)),
            this._parseNumber(this._getValueString(bushRow)),
            this._parseNumber(this._getValueString(flowerRow)),
            this._parseNumber(this._getValueString(grassRow))
        );
    }

    private _parsePlants(treeRow: IDomElement, bushRow: IDomElement, flowerRow: IDomElement, grassRow: IDomElement): Plants {
        return new Plants(
            this._parseNumber(this._getValueString(treeRow)),
            this._parseNumber(this._getValueString(bushRow)),
            this._parseNumber(this._getValueString(flowerRow)),
            this._parseNumber(this._getValueString(grassRow))
        );
    }

    private _parseLand(treeRow: IDomElement, bushRow: IDomElement, flowerRow: IDomElement, grassRow: IDomElement): Land {
        const acresString: ICropTypeMap<string> = {
            [CropType.TREE]: this._getValueString(treeRow),
            [CropType.BUSH]: this._getValueString(bushRow),
            [CropType.FLOWER]: this._getValueString(flowerRow),
            [CropType.GRASS]: this._getValueString(grassRow)
        };

        return Land.FromAcres(this._getTotalAcres(acresString), this._getFilledAcres(acresString));
    }

    private _getFilledAcres(acresString: ICropTypeMap<string>): Acres {
        const filledLand: ICropTypeMap<number> = {
            [CropType.TREE]: this._parseNumber(acresString[CropType.TREE].split(IntelRepository.ACRES_FILLED_SPLIT_PATTERN)[0]),
            [CropType.BUSH]: this._parseNumber(acresString[CropType.BUSH].split(IntelRepository.ACRES_FILLED_SPLIT_PATTERN)[0]),
            [CropType.FLOWER]: this._parseNumber(acresString[CropType.FLOWER].split(IntelRepository.ACRES_FILLED_SPLIT_PATTERN)[0]),
            [CropType.GRASS]: this._parseNumber(acresString[CropType.GRASS].split(IntelRepository.ACRES_FILLED_SPLIT_PATTERN)[0])
        };

        return new Acres(filledLand[CropType.TREE], filledLand[CropType.BUSH], filledLand[CropType.FLOWER], filledLand[CropType.GRASS], 0);
    }

    private _getTotalAcres(acresString: ICropTypeMap<string>): Acres {
        const filledLand: ICropTypeMap<number> = {
            [CropType.TREE]: this._parseNumber(acresString[CropType.TREE].split(IntelRepository.ACRES_FILLED_SPLIT_PATTERN)[1]),
            [CropType.BUSH]: this._parseNumber(acresString[CropType.BUSH].split(IntelRepository.ACRES_FILLED_SPLIT_PATTERN)[1]),
            [CropType.FLOWER]: this._parseNumber(acresString[CropType.FLOWER].split(IntelRepository.ACRES_FILLED_SPLIT_PATTERN)[1]),
            [CropType.GRASS]: this._parseNumber(acresString[CropType.GRASS].split(IntelRepository.ACRES_FILLED_SPLIT_PATTERN)[1])
        };

        return new Acres(filledLand[CropType.TREE], filledLand[CropType.BUSH], filledLand[CropType.FLOWER], filledLand[CropType.GRASS], 0);
    }

    private _getAcreSplit(acreString: string): { filled: number, total: number } {
        const [filled, total]: Array<string> = acreString.split(' of ');

        return {
            filled: this._parseNumber(filled),
            total: this._parseNumber(total)
        };
    }

    private _getValueString(row: IDomElement): string {
        const [, valueCell] = Array.from(row.querySelectorAll('td'));

        return valueCell.textContent ?? this._throwNotValidIntelPage();
    }

    private _parseNumber(str: string): number {
        return parseInt(str.replace(/,/g, ''), 10);
    }

    private async _getStaff(nameCell: IDomElement, countCell: IDomElement): Promise<Staff> {
        const name: string = (nameCell.textContent ?? this._throwNotValidIntelPage()).trim();
        const countString: string = countCell.textContent ?? this._throwNotValidStaffCount(name);
        const count: number = parseInt(countString.replace(/[,[\]]/g, ''), 10);
        const staffStats: UnitStats = await this._getStaffStats(name);

        return new Staff(name, count, staffStats);
    }

    private async _getStaffStats(name: string): Promise<UnitStats> {
        if (isNull(this._units)) {
            this._units = await this._unitsRepository.get();
        }

        return this._units.getByName(name) ?? this._throwNotValidStaff(name);
    }

    private _throwNotValidIntelPage(): never {
        throw new Error('Not a valid intel page');
    }

    private _throwNoIntelCKValue(): never {
        throw new Error('Could not get a CK value for the intel page');
    }

    private _throwNotValidStaff(staffName: string): never {
        throw new Error(`Not valid staff '${staffName}'`);
    }

    private _throwNotValidStaffCount(staffName: string): never {
        throw new Error(`Could not parse count for staff '${staffName}'`);
    }
}
