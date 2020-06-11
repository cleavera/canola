"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const gosod_1 = require("gosod");
const path_1 = require("path");
(() => __awaiter(void 0, void 0, void 0, function* () {
    const packageFile = JSON.parse(yield fs_1.promises.readFile('./package.json', {
        encoding: 'utf-8'
    }));
    const packages = [];
    for (const dependency of Object.keys(packageFile.peerDependencies)) {
        if (dependency.startsWith('@canola')) {
            const [, folder] = dependency.split('/');
            packages.push(path_1.join(__dirname, '../packages', folder));
        }
    }
    if (packages.length > 0) {
        yield gosod_1.packageInstall(packages);
    }
}))();
