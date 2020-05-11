import { CompanyNameRepository, CurrentPointInTimeRepository, FundsRepository, InjuriesRepository, InsuranceRepository, LandRepository, ScoreRepository, StocksRepository, TechRepository, WeatherRepository } from '@actoolkit/domain';

import { genericAdditions } from './generic';

export async function age5(): Promise<void> {
    console.log(await new CompanyNameRepository().get()); // eslint-disable-line no-console
    console.log(await new ScoreRepository().get()); // eslint-disable-line no-console
    console.log(await new FundsRepository().get()); // eslint-disable-line no-console
    console.log(await new InjuriesRepository().get()); // eslint-disable-line no-console
    console.log(await new InsuranceRepository().get()); // eslint-disable-line no-console
    console.log(await new CurrentPointInTimeRepository().get()); // eslint-disable-line no-console
    console.log(await new WeatherRepository().get()); // eslint-disable-line no-console
    console.log(await new LandRepository().get()); // eslint-disable-line no-console
    console.log(await new StocksRepository().get()); // eslint-disable-line no-console
    console.log(await new TechRepository().get()); // eslint-disable-line no-console

    try {
        await genericAdditions();
    } catch (e) {
        console.error(e);
    }
}