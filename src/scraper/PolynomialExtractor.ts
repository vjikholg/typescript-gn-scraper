import { PolynomialInfo } from "../types/PolynomialInfo";
import { Page, ElementHandle } from "puppeteer";
import { MathNode } from "../types/MathNode";
import { launchBrowser } from "./browser";
import path from 'path';


export class PolynomialExtractor { 
    static async search(page : Page) : Promise<ElementHandle<HTMLTableElement>>{ 
        await page.addScriptTag({
            path: path.join(__dirname, '../../dist/MathNodeParser.bundle.js')
        })

        const handle : ElementHandle<Element> | null = await page.$(".galpoly")
        if (!handle) throw new Error (`No galpoly at this URL: ${(page.url())}`)
        handle.evaluate((elem) => { 
            console.log(elem.innerHTML);
        })
        return handle as ElementHandle<HTMLTableElement>; 
    }

    static async process(table : ElementHandle<HTMLTableElement>) : Promise<PolynomialInfo[]> { 
        console.log(table)
        const polynomials : PolynomialInfo[] = [];
        
        const symbols : MathNode[] = await table.$$eval('td', (cells: HTMLTableCellElement[]) => {
            const {parseChildren, parseElement, wrapChildren} = (window as any).MathNode as {
                parseChildren(parent: Node) : MathNode[],
                parseElement(el : HTMLElement) : MathNode,
                wrapChildren(nodes: MathNode[], tag: string) : MathNode
            }

            return cells.map(td => wrapChildren(parseChildren(td), td.tagName)); 
        });

        console.log(symbols);
        return polynomials;
    }
}

async function main() { 
    const browser = await launchBrowser()
    const page = await browser.newPage()
    await page.goto("https://people.maths.bris.ac.uk/~matyd/GroupNames/1/Q8.html"); 
    
    const test = await PolynomialExtractor.search(page);
    const test2 = await PolynomialExtractor.process(test); 

}

main();