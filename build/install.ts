import { Package } from './classes/package';

(async(): Promise<void> => {
    const pkg: Package = await Package.FromPath(process.cwd());

    await pkg.install();
})();
