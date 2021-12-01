import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { basename, join } from 'path';
import { promisify } from 'util';
import { hashElement, HashElementNode } from 'folder-hash';

export class Package {
    public name: string;
    public path: string;

    constructor(name: string, path: string) {
        this.name = name;
        this.path = path;
    }

    public async install(installedList: Array<string> = []): Promise<void> {
        if (installedList.includes(this.name)) {
            return;
        }

        installedList.push(this.name);

        const deps: Array<Package> = await this.getDependencies() || [];

        for (let dep of deps) {
            await dep.install(installedList);
        }

        console.log(`Installing ${ this.name }`);

        await promisify(exec)('npm i', { cwd: this.path });
    }

    public async hash(): Promise<string> {
        const hashElementNode: HashElementNode = await hashElement(this.path, {
            folders: { exclude: ['node_modules', 'dist'] },
            files: { include: ['*.ts', 'package.json'] },
            encoding: 'hex'
        });

        return hashElementNode.hash.toString();
    }

    public async update(builtList: Array<string> = []): Promise<void> {
        if (builtList.includes(this.name)) {
            return;
        }

        builtList.push(this.name);

        const deps: Array<Package> | null = await this.getDependencies();

        if (deps === null) {
            return;
        }

        for (const dep of deps) {
            await dep.update(builtList);
        }

        console.log(`Updating local dependencies for ${ this.name } [${ deps.map((dep: Package) => {
            return dep.name;
        }).join(', ') }]`);

        const outDir: string = join(__dirname, '../.cache');

        try {
            await fs.mkdir(outDir);
        } catch (e) {
            if (e.code !== 'EEXIST') {
                throw e;
            }
        }

        const packageLocations: Array<string> = [];

        for (let dep of deps) {
            const hash: string = await dep.hash();
            const outFile: string = join(outDir, `${ hash }.tgz`);

            packageLocations.push(outFile);

            try {
                await fs.access(outFile)
                continue;
            } catch (e) {
                console.log(`Packing ${ dep.name }`);
            }

            const { stdout } = await promisify(exec)(`npm pack ${ dep.path }`, { cwd: outDir });
            const outs: Array<string> = stdout.split('\n');
            outs.pop();
            const packedName: string = outs.pop() || '';
            await fs.rename(join(outDir, packedName), outFile);
        }

        await promisify(exec)(`npm i ${ packageLocations.join(' ') } --no-save`, { cwd: this.path });
    }

    public async getDependencies(): Promise<Array<Package> | null> {
        const packageFile: { peerDependencies: Record<string, string>; } = JSON.parse(await fs.readFile(join(this.path, './package.json'), {
            encoding: 'utf-8'
        }));

        const packages: Array<Package> = [];

        for (const dependency of Object.keys(packageFile.peerDependencies || {})) {
            if (dependency.startsWith('@canola')) {
                packages.push(await Package.FromName(dependency));
            }
        }

        if (!packages.length) {
            return null;
        }

        return packages;
    }

    public static async FromName(name: string): Promise<Package> {
        const [, folder] = name.split('/');
        const path: string = join(__dirname, '../../packages', folder);

        return new Package(name, path);
    }

    public static async FromPath(path: string): Promise<Package> {
        const folderName: string = basename(path);

        return new Package(`@canola/${ folderName }`, path);
    }
}
