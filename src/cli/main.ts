import type { Model } from '../language/generated/ast.js';
import chalk from 'chalk';
import { Command } from 'commander';
import { SPARKLanguageMetaData } from '../language/generated/module.js';
import { createSPARKServices } from '../language/s-p-a-r-k-module.js';
import { extractAstNode } from './cli-util.js';
import { generate } from './generator.js';
import { NodeFileSystem } from 'langium/node';
/*
import * as url from 'node:url';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
const packageContent = await fs.readFile(packagePath, 'utf-8');
*/
export const generateAction = async (fileName: string, opts: GenerateOptions): Promise<void> => {
    const services = createSPARKServices(NodeFileSystem).SPARK;
    const model = await extractAstNode<Model>(fileName, services);
    const generatedFilePath = generate(model, fileName,opts.destination, opts);
    console.log(chalk.green(`Code generated successfully: ${generatedFilePath}`));
};

export type GenerateOptions = {
    destination?: string;
    only_front?: boolean,
    only_back?: boolean,
    only_opa?: boolean,
    all?: boolean,
    only_Documentation?:boolean,
    only_Backlog?:boolean
}

export default function(): void {
    const program = new Command();

    //program.version(require('../../package.json').version);

    const fileExtensions = SPARKLanguageMetaData.fileExtensions.join(', ');
    program
        .command('generate')
        .argument('<file>', `source file (possible file extensions: ${fileExtensions})`)
        .option('-d, --destination <dir>', 'destination directory of generating')
        .description('Code Generate')
        .action(generateAction);

    program.parse(process.argv);
}
