import { IDomElement, IRequest } from '@canola/core';

import { CompanyName } from '../classes/company-name';
import { Mob } from '../classes/mob';
import { Outgoing } from '../classes/outgoing';
import { Outgoings } from '../classes/outgoings';
import { Staff } from '../classes/staff';
import { Ticks } from '../classes/ticks';
import { UnitStats } from '../classes/unit-stats';
import { Units } from '../classes/units';
import { MobDirection } from '../constants/mob-direction.constant';
import { MobType } from '../constants/mob-type.constant';
import { getRequestService } from '../helpers/get-request-service.helper';
import { CompanyNameRepository } from './company-name.repository';
import { UnitsRepository } from './units.repository';

export class OutgoingsRepository {
    private static readonly RETURNING_MOB_PATTERN: RegExp = /^([0-9,]+) staff returning from ([A-z0-9\s-_|.'{},=]+? \[[0-9]+]) eta ([0-9]+)/;
    private static readonly APPROACHING_MOB_PATTERN: RegExp = /^([0-9,]+) staff approaching ([A-z0-9\s-_|.'{},=]+? \[[0-9]+]) eta ([0-9]+)\. (Defending|Attacking)/;
    private static readonly THERE_MOB_PATTERN: RegExp = /^([0-9,]+) staff at ([A-z0-9\s-_|.'{},=]+? \[[0-9]+]) (Defending|Attacking) for ([1-3]) tick/;

    private readonly _request: IRequest;
    private readonly _unitsRepository: UnitsRepository;
    private _units: Units | null;

    constructor() {
        this._request = getRequestService();
        this._unitsRepository = new UnitsRepository();
        this._units = null;
    }

    public async getOwn(): Promise<Outgoings | null> {
        const response: IDomElement = await this._request.get('/overview.php');
        const outgoingsList: IDomElement | null = response.querySelector('#Outgoing') ?? null;

        if (outgoingsList === null) {
            return null;
        }

        const sender: CompanyName = await new CompanyNameRepository().getOwn();

        return new Outgoings(await this._parseOutgoingList(outgoingsList, sender));
    }

    public async parseOutgoingElement(outgoingElement: IDomElement, sender: CompanyName): Promise<Outgoing> {
        const [, mobDetailsElement = null]: Array<IDomElement | null> = Array.from(outgoingElement.querySelectorAll('a'));
        let mobDetailsLink: string | null = null;

        if (mobDetailsElement !== null) {
            mobDetailsLink = mobDetailsElement.getAttribute('href');
        }

        return this._parseRow((outgoingElement.textContent ?? this._throwInvalidOutgoing()).trim(), mobDetailsLink, sender);
    }

    private async _parseOutgoingList(outgoingsList: IDomElement, sender: CompanyName): Promise<Array<Outgoing>> {
        const rows: Array<IDomElement> = Array.from(outgoingsList.querySelectorAll('div'));
        const mobs: Array<Promise<Outgoing>> = [];

        for (const row of rows) {
            mobs.push(this.parseOutgoingElement(row, sender));
        }

        return Promise.all(mobs);
    }

    private async _parseRow(row: string, mobDetailsLink: string | null, sender: CompanyName): Promise<Outgoing> {
        const mob: Mob = this._parseMobRow(row, sender);
        let staff: Array<Staff> | null = null;

        if (mobDetailsLink !== null) {
            staff = await this._getStaff(mobDetailsLink);
        }

        return new Outgoing(mob, staff);
    }

    private async _getStaff(mobDetailsLink: string): Promise<Array<Staff>> {
        const response: IDomElement = await this._request.get(mobDetailsLink);
        const staffElement: IDomElement = response.querySelector('#CPBox textarea') ?? this._throwOutgoingStaff(mobDetailsLink);
        const staffInformation: string = staffElement.textContent ?? this._throwOutgoingStaff(mobDetailsLink);
        const [, staff]: Array<string> = staffInformation.trim().split('\n\n');
        const staffRows: Array<string> = staff.split('\n');

        return Promise.all(staffRows.map(async(row: string): Promise<Staff> => {
            return this._parseStaff(row);
        }));
    }

    private async _parseStaff(row: string): Promise<Staff> {
        const [name, count]: Array<string> = row.split(': ');

        return new Staff(
            name,
            parseInt(count.replace(/,/g, ''), 10),
            await this._getStaffStats(name)
        );
    }

    private _parseMobRow(row: string, sender: CompanyName): Mob {
        if (OutgoingsRepository.APPROACHING_MOB_PATTERN.test(row)) {
            return this._parseApproachingMob(row, sender);
        }

        if (OutgoingsRepository.RETURNING_MOB_PATTERN.test(row)) {
            return this._parseReturningMob(row, sender);
        }

        if (OutgoingsRepository.THERE_MOB_PATTERN.test(row)) {
            return this._parseThereMob(row, sender);
        }

        this._throwInvalidOutgoing(row);
    }

    private _parseReturningMob(mobString: string, sender: CompanyName): Mob {
        const [, , targetString, etaString]: RegExpExecArray = OutgoingsRepository.RETURNING_MOB_PATTERN.exec(mobString) ?? this._throwInvalidOutgoing(mobString);

        return new Mob(
            sender,
            CompanyName.FromString(targetString),
            Ticks.FromString(etaString),
            MobDirection.RETURNING
        );
    }

    private _parseApproachingMob(mobString: string, sender: CompanyName): Mob {
        const [, , targetString, etaString, typeString]: RegExpExecArray = OutgoingsRepository.APPROACHING_MOB_PATTERN.exec(mobString) ?? this._throwInvalidOutgoing(mobString);

        return new Mob(
            sender,
            CompanyName.FromString(targetString),
            Ticks.FromString(etaString),
            MobDirection.APPROACHING,
            this._getMobType(typeString)
        );
    }

    private _parseThereMob(mobString: string, sender: CompanyName): Mob {
        const [, , targetString, typeString, etaString]: RegExpExecArray = OutgoingsRepository.THERE_MOB_PATTERN.exec(mobString) ?? this._throwInvalidOutgoing(mobString);

        return new Mob(
            sender,
            CompanyName.FromString(targetString),
            Ticks.FromString(etaString),
            MobDirection.THERE,
            this._getMobType(typeString)
        );
    }

    private _getMobType(typeString: string): MobType {
        if (typeString === 'Defending') {
            return MobType.DEFENDING;
        }

        return MobType.ATTACKING;
    }

    private async _getStaffStats(name: string): Promise<UnitStats> {
        if (this._units === null) {
            this._units = await this._unitsRepository.get();
        }

        return this._units.getByName(name) ?? this._throwNotValidStaff(name);
    }

    private _throwInvalidOutgoing(str: string = ''): never {
        throw new Error(`Could not parse outgoing '${str}'`);
    }

    private _throwOutgoingStaff(mobDetailsLink: string): never {
        throw new Error(`Could not parse outgoing staff '${mobDetailsLink}'`);
    }

    private _throwNotValidStaff(staffName: string): never {
        throw new Error(`Could not get staff details for staff with name ${staffName}`);
    }
}
