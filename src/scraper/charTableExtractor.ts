import { ElementHandle, Page } from "puppeteer";
import { CharacterTable } from "../types";

/**
 * Mental note:
 * 1. ElementHandle<T> = "pointer" to DOM object of type T
 * 2. ElementHandle<T>.evaluate((el) => fn(el)) reconstructs fn in browser, then DOM element passed by value into fn 
 */

export class CharTableExtractor {
    private async get(page: Page) : Promise<any> {
        const rows : ElementHandle<HTMLTableRowElement>[] = await this.getCharTable(page); 
        rows.map((handler) => this.extractFromRow(handler))
        return rows;
    }
    
    /**
     * Extracts ElementHandle of class = chartable. 
     * 
     * @param page The page we're looking for class=chartable in
     * @returns ElementHandle<HTMLTableRowElement>[], array of handlers pointing to the <tr> within <table> 
     */
    private async getCharTable(page: Page) : Promise<ElementHandle<HTMLTableRowElement>[]> {
        const table : ElementHandle<Element> | null = await page.$(".chartable"); // class uses . 
        if (!table) throw new Error("chartable element not found"); 
        return await (table.$$("tr")) as ElementHandle<HTMLTableRowElement>[];
    }

    /**
     * Extracts a list string[] of the <td> elems in each row <tr> 
     * 
     * @param row handler for our HTMLTableRowElement - obtained from getCharTable above. 
     * @returns string[] , textContent of each <td> element stored in string[]
     */
    private async extractFromRow(row: ElementHandle<HTMLTableRowElement>) : Promise<string[]> {
        const rowData : ElementHandle<HTMLTableCellElement>[] = await row.$$('td')
        const texts : string[]  = await Promise.all(
            rowData.map(cell => cell.evaluate(el => el.textContent?.trim())) 
        );

        return texts; 
    }
}


