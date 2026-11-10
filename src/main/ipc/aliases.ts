import { promises as fs } from 'node:fs';
import path from 'node:path';

type AliasEntry = { id: string; alias: string };

const parseAliasesCsv = (contents: string): AliasEntry[] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let quoted = false;
    const csv = contents.replace(/^\uFEFF/, '');

    for (let index = 0; index < csv.length; index++) {
        const character = csv[index];
        if (quoted) {
            if (character === '"' && csv[index + 1] === '"') {
                field += '"';
                index++;
            } else if (character === '"') quoted = false;
            else field += character;
        } else if (character === '"' && !field) quoted = true;
        else if (character === ',') {
            row.push(field);
            field = '';
        } else if (character === '\r' || character === '\n') {
            if (character === '\r' && csv[index + 1] === '\n') index++;
            row.push(field);
            rows.push(row);
            row = [];
            field = '';
        } else if (character === '"') throw new Error(`CSV 第 ${rows.length + 1} 行格式无效`);
        else field += character;
    }

    if (quoted) throw new Error('CSV 引号未闭合');
    if (field || row.length) {
        row.push(field);
        rows.push(row);
    }

    if (rows[0]?.length === 2 && rows[0][0].trim().toLowerCase() === 'id' && rows[0][1].trim().toLowerCase() === 'alias') rows.shift();

    const aliases: Record<string, string> = {};
    for (const [index, columns] of rows.entries()) {
        if (!columns.some((column) => column.trim())) continue;
        if (columns.length !== 2) throw new Error(`CSV 第 ${index + 1} 行必须包含 id 和 alias 两列`);
        const id = columns[0].trim();
        if (!/^\d+$/.test(id)) throw new Error(`CSV 第 ${index + 1} 行的 id 无效`);
        aliases[id] = columns[1].trim();
    }
    return Object.entries(aliases).map(([id, alias]) => ({ id, alias }));
};

export const getAliasHandlers = () => ({
    'aliases:import-csv': async (_event: Electron.IpcMainInvokeEvent, inputPath: string) => {
        if (!path.isAbsolute(inputPath) || path.extname(inputPath).toLowerCase() !== '.csv') throw new Error('无效的 CSV 文件路径');
        return parseAliasesCsv(await fs.readFile(inputPath, 'utf8'));
    },
    'aliases:export-csv': async (_event: Electron.IpcMainInvokeEvent, aliases: Record<string, string>, outputPath: string) => {
        if (!path.isAbsolute(outputPath) || path.extname(outputPath).toLowerCase() !== '.csv') throw new Error('无效的 CSV 文件路径');
        if (!aliases || typeof aliases !== 'object' || Array.isArray(aliases)) throw new Error('无效的插件别名');
        const rows = ['id,alias'];
        for (const [id, alias] of Object.entries(aliases)) {
            if (!/^\d+$/.test(id) || typeof alias !== 'string') throw new Error('无效的插件别名');
            if (!alias.trim()) continue;
            const escapedAlias = /[",\r\n]/.test(alias) ? `"${alias.replaceAll('"', '""')}"` : alias;
            rows.push(`${id},${escapedAlias}`);
        }
        await fs.writeFile(outputPath, `\uFEFF${rows.join('\n')}\n`, 'utf8');
    }
});
