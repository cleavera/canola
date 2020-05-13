import { IDomElement, INJECTOR, IRequest, REQUEST } from '@actoolkit/core';
import { Maybe } from '@cleavera/types';
import { isNull } from '@cleavera/utils';

import { CompanyName } from '../classes/company-name';
import { Mob } from '../classes/mob';
import { Ticks } from '../classes/ticks';
import { MobDirection } from '../constants/mob-direction.constant';
import { MobType } from '../constants/mob-type.constant';

export class OutgoingsRepository {
    private static readonly RETURNING_MOB_PATTERN: RegExp = /^([0-9,]+) staff returning from ([A-z0-9\s-_|.'{},]+? \[[0-9]+]) eta ([0-9]+)/;
    private static readonly APPROACHING_MOB_PATTERN: RegExp = /^([0-9,]+) staff approaching ([A-z0-9\s-_|.'{},]+? \[[0-9]+]) eta ([0-9]+)\. (Defending|Attacking)/;
    private static readonly THERE_MOB_PATTERN: RegExp = /^([0-9,]+) staff at ([A-z0-9\s-_|.'{},]+? \[[0-9]+]) (Defending|Attacking) for ([1-3]) ticks/;

    public async get(): Promise<Maybe<Array<Mob>>> {
        const request: IRequest = INJECTOR.get<IRequest>(REQUEST) ?? this._throwNoRequestStrategy();
        const response: IDomElement = await request.get('/overview.php');
        const outgoingsList: Maybe<IDomElement> = response.querySelector('#Outgoing') ?? null;

        if (isNull(outgoingsList)) {
            return null;
        }

        return this._parseOutgoingList(outgoingsList);
    }

    private async _parseOutgoingList(outgoingsList: IDomElement): Promise<Array<Mob>> {
        const rows: Array<IDomElement> = Array.from(outgoingsList.querySelectorAll('div'));
        const mobs: Array<Promise<Mob>> = [];

        for (const row of rows) {
            mobs.push(this._parseMobRow((row.textContent ?? this._throwInvalidOutgoing()).trim()));
        }

        return Promise.all(mobs);
    }

    private async _parseMobRow(row: string): Promise<Mob> {
        if (OutgoingsRepository.APPROACHING_MOB_PATTERN.test(row)) {
            return this._parseApproachingMob(row);
        }

        if (OutgoingsRepository.RETURNING_MOB_PATTERN.test(row)) {
            return this._parseReturningMob(row);
        }

        if (OutgoingsRepository.THERE_MOB_PATTERN.test(row)) {
            return this._parseThereMob(row);
        }

        this._throwInvalidOutgoing(row);
    }

    private _parseReturningMob(mobString: string): Mob {
        const [, , targetString, etaString]: RegExpExecArray = OutgoingsRepository.RETURNING_MOB_PATTERN.exec(mobString) ?? this._throwInvalidOutgoing(mobString);

        return new Mob(
            CompanyName.FromString(targetString),
            Ticks.FromString(etaString),
            MobDirection.RETURNING
        );
    }

    private _parseApproachingMob(mobString: string): Mob {
        const [, , targetString, etaString, typeString]: RegExpExecArray = OutgoingsRepository.APPROACHING_MOB_PATTERN.exec(mobString) ?? this._throwInvalidOutgoing(mobString);

        return new Mob(
            CompanyName.FromString(targetString),
            Ticks.FromString(etaString),
            MobDirection.APPROACHING,
            this._getMobType(typeString)
        );
    }

    private _parseThereMob(mobString: string): Mob {
        const [, , targetString, typeString, etaString]: RegExpExecArray = OutgoingsRepository.THERE_MOB_PATTERN.exec(mobString) ?? this._throwInvalidOutgoing(mobString);

        return new Mob(
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

    private _throwNoRequestStrategy(): never {
        throw new Error('No request strategy registered');
    }

    private _throwInvalidOutgoing(str: string = ''): never {
        throw new Error(`Could not parse outgoing '${str}'`);
    }
}
