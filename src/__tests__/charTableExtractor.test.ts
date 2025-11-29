import { Browser, launch, Page } from "puppeteer"
import { launchBrowser }         from "../scraper/browser";
import { CharTableExtractor }    from "../scraper/charTableExtractor"
import { MathNode }              from "../types"; 
import { test, expect, describe }    from "@jest/globals";


const c32_noTable : string = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C32.html"; 
const c1 : string          = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C1.html"
const c4 : string          = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C4.html"; 
const c33c2 : string       = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C3%5E3sC2.html"; 
const c2dic6 : string      = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C2xDic6.html"; 
const c11c5 : string       = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C11sC5.html";
const q8 : string          = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/Q8.html"

const tests : string[] = [c4, c33c2,c2dic6,c11c5, q8]

// Define some helper function for console. 
function mathNodeToLatex(node: MathNode): string {
    switch (node.type) {
        case 'text':
            return node.value;
        
        case 'sqrt':
            return `\\sqrt{${mathNodeToLatex(node.value)}}`;
        
        case 'fraction':
            return `\\frac{${mathNodeToLatex(node.numerator)}}{${mathNodeToLatex(node.denominator)}}`;
        
        case 'sup':
            return `^{${mathNodeToLatex(node.value)}}`;
        
        case 'sub':
            return `_{${mathNodeToLatex(node.value)}}`;
        
        case 'group':
            return node.children.map(mathNodeToLatex).join('');
    }
}

// --- Table rendering helpers ---

/**
 * Render a MathNode[][] as a “table-like” string.
 * Each row is a line, columns are padded to the max width in that column.
 */
export function renderCharTable(table: MathNode[][]): string {
    if (table.length === 0) {
        return '(empty char table)';
    }

    // 1) Render each cell to a string
    const rendered: string[][] = table.map(row =>
        row.map(cell => mathNodeToLatex(cell))
    );

    const rowCount = rendered.length;
    const colCount = Math.max(...rendered.map(r => r.length));

    // 2) Compute max width of each column
    const colWidths: number[] = [];
    for (let col = 0; col < colCount; col++) {
        let max = 0;
        for (let row = 0; row < rowCount; row++) {
            const value = rendered[row][col] ?? '';
            if (value.length > max) max = value.length;
        }
        colWidths[col] = max;
    }

    // 3) Build horizontal rule (optional but nice)
    const hr =
        '+' +
        colWidths.map(w => '-'.repeat(w + 2)).join('+') +
        '+';

    // 4) Build each row line with padding
    const lines: string[] = [];
    lines.push(hr);
    for (let r = 0; r < rowCount; r++) {
        const cells = rendered[r];
        const paddedCells = colWidths.map((w, c) => {
          const val = cells[c] ?? '';
          return ' ' + val.padEnd(w, ' ') + ' ';
        });
        lines.push('|' + paddedCells.join('|') + '|');
        lines.push(hr);
    }

    return lines.join('\n');
}

/**
 * Convenience: print MathNode[][] as a table to console.
 */
function printCharTable(table: MathNode[][]): void {
  console.log(renderCharTable(table));
}



async function startAndNavigateToPage(url : string) : Promise<Page> {
    const page : Page = await (await launchBrowser()).newPage();
    await page.goto(url);
    return page;
}

test("Cyclic Group of Order 32 should have no table, expecting error", async() => {
    const page : Page = (await startAndNavigateToPage(c32_noTable));

    await expect(CharTableExtractor.get(page))
    .rejects
    .toThrow()

    page.close();
})

test("Cyclic Group on Order 1 - expecting simple table, ensure base recursion works", async() => {
    const page : Page = (await startAndNavigateToPage(c1));
    const table : MathNode[][] = await CharTableExtractor.get(page);
    printCharTable(table);
    expect(table).toBeDefined();

    page.close();

})

tests.forEach((link) => {
    test(`checking: ${link}`, async() => {
    const page : Page = (await startAndNavigateToPage(link));
    const table : MathNode[][] = await CharTableExtractor.get(page);
    printCharTable(table);
    expect(table).toBeDefined();

    page.close();
    })
})