import { CompanyName, CompanyNameRepository, IntelRepository } from '@actoolkit/domain';

import { isPage } from '../shared';
import { driveByValueFeature } from './features/drive-by-value.feature';
import { hackValueFeature } from './features/hack-value.feature';
import { spyReportFeature } from './features/spy-report.feature';

export async function intelAdditions(): Promise<void> {
    if (!isPage('/intelligence.php')) {
        return;
    }

    await Promise.all([
        hackValueFeature(),
        driveByValueFeature(),
        spyReportFeature()
    ]);
}
