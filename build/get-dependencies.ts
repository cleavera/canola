import { IDict } from '@cleavera/types';
import { promises as fs } from 'fs';
import { packageInstall } from 'gosod';
import { join } from 'path';

(async(): Promise<void> => {
    const packageFile: { peerDependencies: IDict<string>; } = JSON.parse(await fs.readFile('./package.json', {
        encoding: 'utf-8'
    }));

    const packages: Array<string> = [];

    for (const dependency of Object.keys(packageFile.peerDependencies)) {
        if (dependency.startsWith('@canola')) {
            const [, folder] = dependency.split('/');
            packages.push(join(__dirname, '../packages', folder));
        }
    }

    if (packages.length > 0) {
        await packageInstall(packages);
    }
})();
