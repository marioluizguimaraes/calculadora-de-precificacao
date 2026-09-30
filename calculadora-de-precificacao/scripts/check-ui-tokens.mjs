/**
 * Acusa classes do shadcn/ui que colidem com tokens do HeroUI (ver docs/UI-LIBRARIES.md).
 * Roda apenas sobre o código gerado pelos CLIs (shadcn / React Bits).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIRS = ['src/shared/components/ui', 'src/shared/components/react-bits'];

const REPLACEMENTS = {
  muted: 'default',
  accent: 'default-hover',
  'accent-foreground': 'default-foreground',
};

// bg-muted, hover:bg-accent/50, text-accent-foreground... (mas não text-muted-foreground, que tem ponte)
const COLLISION =
  /(?<![\w-])((?:[\w-]+:)*)(bg|from|via|to|ring|outline|border|fill|stroke|text)-(muted|accent)(-foreground)?(?![\w-])(\/\d+)?/g;

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (/\.(tsx?|jsx?)$/.test(entry)) yield path;
  }
}

const problems = [];
for (const dir of DIRS) {
  for (const file of walk(dir)) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        for (const match of line.matchAll(COLLISION)) {
          const [full, variants, utility, token, foreground = '', opacity = ''] = match;
          if (token === 'muted' && foreground) continue; // muted-foreground → ponte ok
          if (utility === 'text' && !foreground) continue; // text-muted/text-accent → semântica HeroUI
          const replacement = REPLACEMENTS[token + foreground];
          problems.push(
            `${relative(process.cwd(), file)}:${index + 1}  ${full}  →  ${variants}${utility}-${replacement}${opacity}`,
          );
        }
      });
  }
}

if (problems.length > 0) {
  console.error('Classes do shadcn que colidem com tokens do HeroUI:\n');
  console.error(problems.map((p) => `  ${p}`).join('\n'));
  console.error(`\n${problems.length} ocorrência(s). Veja docs/UI-LIBRARIES.md.`);
  process.exit(1);
}
console.log('ui-tokens: nenhuma colisão HeroUI × shadcn encontrada.');
