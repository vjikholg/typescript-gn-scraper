import { ElementHandle, Page } from "puppeteer";
import { MathNode } from "../types";

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
    async get(page: Page) : Promise<MathNode[][]> {
        const rows : ElementHandle<HTMLTableRowElement>[] = await this.getCharTable(page); 
        return Promise.all(rows.map((tr) => this.extractFromRow(tr))); 
    }

    /**
     * Extracts ElementHandle of class = chartable. 
     * 
     * @param page The page we're looking for class=chartable in
     * @returns ElementHandle<HTMLTableRowElement>[], array of handlers pointing to the <tr> within <table> 
     */
    private async getCharTable(page: Page) : Promise<ElementHandle<HTMLTableRowElement>[]> {
        const table : ElementHandle<Element> | null = await page.$(".chartable"); // class uses . 
        if (!table) throw new Error(`no character table for the following page: ${page.url()}`); 
        return await (table.$$("tr")) as ElementHandle<HTMLTableRowElement>[];
    }

    /**
     * Extracts a list MathNode[] of the <td> elems in each row <tr> 
     * This means every <td> -> MathNode, so <tr> -> MathNode[], and so an entire character table can be built MathNode[][]
     * 
     * 
     * @param row handler for our HTMLTableRowElement - obtained from getCharTable above. 
     * @returns string[] , textContent of each <td> element stored in string[]
     */
    private async extractFromRow(row: ElementHandle<HTMLTableRowElement>) : Promise<MathNode[]> {
        return row.$$eval('td', (cells: HTMLTableCellElement[]) => {
            function parseChildren(parent: Node): MathNode[] { 
                const results: MathNode[] = [];                                                 
                parent.childNodes.forEach((child) => {                                          // for each child: 
                    // check recursive base case - text or empty node                           // 1. if text node -> return MathNode w/ type text
                    if (child.nodeType === Node.TEXT_NODE) {                                    // 2. if element node, i.e., <td><span ... > </td>, determine span class
                        const text : string = child.textContent?.trim() ?? ''; // safety        //  2a. if fraction -> look at parseChildren <sup>, <sub> elems 
                        if (text) {                                                             //  2b. if sqrt -> 
                            results.push({type: "text", value: text} as MathNode); 
                        }
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        results.push(parseElement(child as HTMLElement) as MathNode); 
                    }
                })
                return results;
            }

            function parseElement(el: HTMLElement): MathNode {
                if (el.tagName === "SPAN" && el.classList.contains("frac")) {
                    const sup: HTMLElement = el.querySelector("sup")!; 
                    const sub: HTMLElement = el.querySelector("sub")!; 
                    return {
                        type: "fraction", 
                        numerator: parseElement(sup!) ?? {type: "text", value: ''} as MathNode,
                        denominator: parseElement(sub!) ?? {type:"text", value: ''} as MathNode
                    } as MathNode; 
                }

                // Sqrt: <sup> 1- <span>√<span> -15 </span></span> </sup>
                if (el.tagName === "SPAN" && el.innerText.trim().startsWith("√")) {     //  
                    return { 
                        type: "sqrt", 
                        value: (el.hasChildNodes()) ? 
                            parseChildren(el) : 
                            {type: "text", value: el.innerText}   // if childnode -> always only 1 since 
                    } as MathNode                                 // this is due to fact GN uses 2 spans for sqrt 
                }                                                 // one for symbol, other for contents
                // Sub, Sup cases

                if (el.tagName === "SUB") {
                    return {
                        type: "sub", 
                        value: wrapChildren(parseChildren(el), el.tagName)
                    } as MathNode
                }

                if (el.tagName === "SUP") {
                    return {
                        type: "sup", 
                        value: wrapChildren(parseChildren(el), el.tagName)
                    } as MathNode
                }

                // Fallback group node: 
                return {
                    type: "group", 
                    tag: el.tagName, 
                    children: parseChildren(el)
                } as MathNode
            }

            function wrapChildren(nodes: MathNode[], tag: string) : MathNode { 
                if (nodes.length === 1) return nodes[0]
                return {
                    type: "group", 
                    tag: tag, 
                    children: nodes
                } as MathNode
            }
            return cells.map(td => parseChildren(td)).flat(); 
        });
    }

    /**
     * handle logic of parsing through nodes, hands off processing to parseElement
     * @param parent parent node in question we're recursively parsing through
     * @returns List MathNode[] containing mathnode(s) representing the nested HTML elements - in particular, given parent node, it returns the list of children
     */
    private parseChildren(parent: Node) : MathNode[] { 
        const results: MathNode[] = [];                                                 
        parent.childNodes.forEach((child) => {                                          // for each child: 
            // check recursive base case - text or empty node                           // 1. if text node -> return MathNode w/ type text
            if (child.nodeType === Node.TEXT_NODE) {                                    // 2. if element node, i.e., <td><span ... > </td>, determine span class
                const text : string = child.textContent?.trim() ?? ''; // safety        //  2a. if fraction -> look at parseChildren <sup>, <sub> elems 
                if (text) {                                                             //  2b. if sqrt -> 
                    results.push({type: "text", value: text} as MathNode); 
                }
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                results.push(this.parseElement(child as HTMLElement) as MathNode); 
            }
        })
        return results;
    }

    /**
     * Handles the logic mapping HTMLElement -> MathNodes
     * If detect children in el: HTMLElement, hands off further parsing back to parseChildren. 
     * 
     * @param el 
     * @returns 
     */
    private parseElement(el: HTMLElement) : MathNode { 
        // plain text - <sup> 1- <span>√<span> -15 </span></span> </sup>; the "1-" is considered a text
        // handled in the above parseChildren case

        // Fraction: <span class = "fraction"> <sup>...</sup><sub>...</sub>
        if (el.tagName === "SPAN" && el.classList.contains("frac")) {
            const sup: HTMLElement = el.querySelector("sup")!; 
            const sub: HTMLElement = el.querySelector("sub")!; 
            return {
                type: "fraction", 
                numerator: this.parseElement(sup!) ?? {type: "text", value: ''} as MathNode,
                denominator: this.parseElement(sub!) ?? {type:"text", value: ''} as MathNode
            } as MathNode; 
        }
        
        // Sqrt: <sup> 1- <span>√<span> -15 </span></span> </sup>
        if (el.tagName === "SPAN" && el.innerText.trim().startsWith("√")) {     //  
            return { 
                type: "sqrt", 
                value: (el.hasChildNodes()) ? 
                    this.parseChildren(el) : 
                    {type: "text", value: el.innerText}   // if childnode -> always only 1 since 
            } as MathNode                                 // this is due to fact GN uses 2 spans for sqrt 
        }                                                 // one for symbol, other for contents
        // Sub, Sup cases

        if (el.tagName === "SUB") {
            return {
                type: "sub", 
                value: this.wrapChildren(this.parseChildren(el), el.tagName)
            } as MathNode
        }

        if (el.tagName === "SUP") {
            return {
                type: "sup", 
                value: this.wrapChildren(this.parseChildren(el), el.tagName)
            } as MathNode
        }

        // Fallback group node: 
        return {
            type: "group", 
            tag: el.tagName, 
            children: this.parseChildren(el)
        } as MathNode
    }

    private wrapChildren(nodes: MathNode[], tag: string) : MathNode { 
        if (nodes.length === 1) return nodes[0]
        return {
            type: "group", 
            tag: tag, 
            children: nodes
        } as MathNode
    }
}


