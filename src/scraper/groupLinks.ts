import { Browser } from "puppeteer";

// TODO in cells = row.quertySelectoryAll('td'), write html -> latex converter to grab names instead of just labels for our groups

export async function getGroupLinks(browser : Browser) {
    const page = await browser.newPage();

    await page.goto('https://people.maths.bris.ac.uk/~matyd/GroupNames/index500.html');
    await page.waitForSelector('.gptable');

    const groupLinks : LinkInfo[] = await page.evaluate(() => {
        const tables : HTMLTableElement[] = Array.from(document.querySelectorAll('.gptable')); // selects all tables and returns a node-list
        const allRows: (LinkInfo | null)[] = [];                                     // we'll use this to keep 1st column of rows 

        tables.forEach(table => {   
            const rows = Array.from(table.querySelectorAll('tr')).slice(1).map(row => {     // does a few things:
                const cells: HTMLTableCellElement[] = Array.from(row.querySelectorAll('td'));   // 1. table.querySelectorAll('tr) grabs row and subseq. cols
                    
                    // const canonicalName : String = cells[1]?.textContent.trim();             // TODO: check if this properly grabs label, canonical name. 
                    // const label : String = cells[3]?.textContent.trim();
                
                    const nameLink : HTMLAnchorElement | null | undefined = cells[0]?.querySelector('a');    // 2. slice(1) grabs the data in table, slice(0) grabs header, not useful
                    const orderText : string | undefined = cells[2]?.textContent?.trim();                    // 3. .map(row => ...) converts each 1st column into an array
                    const order: number = orderText ? parseInt(orderText, 10) : NaN;                         // anyways, cells grabs all cells in the row, each row 6 columns, 
                    // we only want 0 for name + href, 2 order of group
                    
                    const test: LinkInfo | null = nameLink ? { 
                        name: cells[0]?.id ?? nameLink.textContent!.trim(), 
                        href: nameLink.href, 
                        order: order 
                    } : null;
                    
                    // console.log(test);
                    return test 
            });
            allRows.push(...rows);
        });
        return allRows.filter(Boolean) as LinkInfo[];
    });

    return groupLinks;
}

export type LinkInfo = {
    name: string; 
    href: string; 
    order: number; 
}