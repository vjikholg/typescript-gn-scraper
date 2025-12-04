import { ElementHandle, Page } from "puppeteer";
import { launchBrowser } from "./browser";



class SeriesExtractor { 
    static async findHandle(page: Page) : Promise<ElementHandle<HTMLTableElement>[]> { 
        let table : ElementHandle<HTMLTableElement>[] = (await page.$$("table.series")) // <table class="series"> 
        .filter((elem : ElementHandle<HTMLTableElement>) => 
            elem.evaluate((series : HTMLTableElement) => {
                console.log(series.innerText);
                return (series.innerText.includes("Series") || 
                series.innerText.includes("Central")) || 
                series.innerText.includes("Jennings"); 
            })
        );
        return table; 
    }

    static async processSeries(handles : ElementHandle<HTMLTableElement>[], page : Page) : Promise<Record<string, string[]>> { 
        const processed : Record<string, string[]> = {};  
        // we need to get "self label for ending series"; 
        const nav : ElementHandle<HTMLLIElement>[] = (await page.$$("nav ul li"));
        let selfLabel : string = ""; 
        
        for (let i = 0 ; i < nav.length; i++) {
            if (await nav[i].evaluate((li : HTMLLIElement) => li.innerText.toLowerCase().includes("label"))) { 
                selfLabel = await nav[i+1].evaluate((li : HTMLLIElement) => { 
                    return li.innerText
                })
            }
        }

        for (const table of handles) { 
            const children : ElementHandle<HTMLTableCellElement>[] = await table.$$("tr td")
            const label : string = await children[0].evaluate((td) => { 
                return td.innerText.trim()!;
            })
            
            const rawseries : ElementHandle<HTMLAnchorElement>[] = (await children[1].$$('a'))
            const series : string[] = []; 
            
            for (const column of rawseries) { 
                series.push(await column.evaluate((elem : HTMLAnchorElement) => { 
                    return elem.innerText;
                }))
            }

            if (label !== "Upper central") {
                series.push(selfLabel);
            }
            processed[label] = series;
        }
        return processed; 
    }
}

async function main() { 
    const browser = await launchBrowser()
    const page = await browser.newPage()
    await page.goto("https://people.maths.bris.ac.uk/~matyd/GroupNames/1/Q8.html"); 
    
    const test = await SeriesExtractor.findHandle(page);
    const test2 = await SeriesExtractor.processSeries(test, page);
    console.log(test2);   
}

main();