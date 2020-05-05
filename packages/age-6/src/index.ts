import { CompanyRepository } from '@actoolkit/your-company';

export async function age6ContentScript(): Promise<void> {
    console.log(await new CompanyRepository().getCompany()); // eslint-disable-line no-console
}
