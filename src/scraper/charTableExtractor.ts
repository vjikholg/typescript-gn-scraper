import { ElementHandle, Page } from "puppeteer";
import { MathNode, parseChildren, parseElement, wrapChildren} from "../types/MathNode"
import { ScriptInjection } from "./browser";

/**
 * Mental note:
 * 1. ElementHandle<T> = "pointer" to DOM object of type T
 * 2. ElementHandle<T>.evaluate((el) => fn(el)) reconstructs fn in browser, then DOM element passed by value into fn 
 * 3. Character Table invariant - first two rows & column are labels. 
 */

export class CharTableExtractor {
    /**
     * External facing method of which we call, provide the webpage, and extract a character table in MathNode[][] format. 
     * @param page assumingly a group-names page w/ character table. 
     * @returns MathNode[][], 2d array representing the character table of an elem
     */
    static async get(page: Page) : Promise<MathNode[][]> {
        ScriptInjection(page);
        const rows : ElementHandle<HTMLTableRowElement>[] = await this.getCharTable(page); 
        return Promise.all(rows.map((tr) => this.extractFromRow(tr))); 
    }

    /**
     * Extracts ElementHandle of class = chartable. 
     * 
     * @param page The page we're looking for class=chartable in
     * @returns ElementHandle<HTMLTableRowElement>[], array of handlers pointing to the <tr> within <table> 
     */
    static async getCharTable(page: Page) : Promise<ElementHandle<HTMLTableRowElement>[]> {
        const listOfRowElements : ElementHandle<HTMLTableRowElement>[] = await page.$$(".chartable tr"); 
        if (listOfRowElements.length === 0) throw new Error(`no character table for the following page: ${page.url()}`); 
        
        return listOfRowElements;
    }

    /**
     * Extracts a list MathNode[] of the <td> elems in each row <tr> 
     * This means every <td> -> MathNode, so <tr> -> MathNode[], and so an entire character table can be built MathNode[][]
     * 
     * 
     * @param row handler for our HTMLTableRowElement - obtained from getCharTable above. 
     * @returns string[] , textContent of each <td> element stored in string[]
     */
    static async extractFromRow(row: ElementHandle<HTMLTableRowElement>) : Promise<MathNode[]> {
        
        // grab all rows
        return row.$$eval('td', (cells: HTMLTableCellElement[]) => {
        // 
            
            const {parseChildren, parseElement, wrapChildren} = (window as any).MathNode as {
                parseChildren(parent: Node) : MathNode[],
                parseElement(el : HTMLElement) : MathNode,
                wrapChildren(nodes: MathNode[], tag: string) : MathNode
            }

            return cells.map(td => wrapChildren(parseChildren(td), td.tagName)); 
        });
    }
}
