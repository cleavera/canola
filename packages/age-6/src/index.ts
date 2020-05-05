import { CompanyNameRepository, FundsRepository, InjuriesRepository, ScoreRepository } from '@actoolkit/your-company';

export async function age6ContentScript(): Promise<void> {
    console.log(await new CompanyNameRepository().get()); // eslint-disable-line no-console
    console.log(await new ScoreRepository().get()); // eslint-disable-line no-console
    console.log(await new FundsRepository().get()); // eslint-disable-line no-console
    console.log(await new InjuriesRepository().get()); // eslint-disable-line no-console
}
