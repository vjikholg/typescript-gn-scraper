import { Page, ElementHandle, launch } from "puppeteer";
import { launchBrowser } from "./browser";

export class MaxSubQuoExtractor { 

    /**
     * 
     * @param page 
     */
    static async getMaxSubgroupsQuotients(page: Page) { 
        try { 
            return await this.processPElement(await this.search(page)); 
        } catch (err: any) {
            console.error(err.message)
        }
    }


    /**
     * searches page for <p> handles and returns an array of <p> elementHandles
     * @param page 
     */
    static async search(page: Page) : Promise<ElementHandle<HTMLParagraphElement>> {
        const paragraphs : ElementHandle<HTMLParagraphElement>[] = await page.$$("p"); 
        for (const p of paragraphs) {
            const containsGroup : boolean = await p.evaluate((elem : HTMLParagraphElement) => { 
                return elem.innerText.includes("maximal subgroup");
            })
            if (containsGroup) return p; 
        }
        throw new Error(`No maximal subgroup at link: ${page.url}`);  
    }

    /**
     * Given a <p> elem, searches for a list of <a>, <br> elements and returns two string[] that represent the 
     * names of the maximal subgroups/quotients. 
     * @param pElem <p> element in question containing the maximal, minimal subgroups. 
     * @returns 
     */
    static async processPElement(pElem : ElementHandle<HTMLParagraphElement>) : Promise<string[][]> { 
        const children : ElementHandle<HTMLAnchorElement | HTMLElement>[] = await pElem.$$("a, b"); // grabs elements a, br
        const maximal : string[] = [];
        const minimal : string[] = []; 

        let isMaximal : boolean = true; 
        for (let i = 0; i < children.length; i++) { 

            const tag : any[] = await children[i].evaluate((elem : HTMLAnchorElement | HTMLElement ) => { 
                return [elem.tagName.trim().toLowerCase(), elem.innerText]; 
            })

            if (tag[0] === 'a') {
                tag.push((await children[i].getProperty('href')))
            }

            console.log(`${i}: ${tag}`);    
            
            if (tag[0] === "b") {
                if (tag[1].includes("quotient")) isMaximal = false; 
                continue; 
            } 

            const name : string = await children[i].evaluate((elem : HTMLAnchorElement | HTMLElement) => { 
                return elem.innerText.trim(); 
            })

            if (name === "") continue;

            if (isMaximal) { 
                maximal.push(name); // get by string, can find map. 
            } else { 
                minimal.push(name);
            }
        }
        return [maximal, minimal] as string[][];
    }
}

async function main() { 
    const browser = await launchBrowser()
    const page = await browser.newPage()
    await page.goto("https://people.maths.bris.ac.uk/~matyd/GroupNames/1/Q8.html"); 
    
    const test : ElementHandle<HTMLParagraphElement> = await MaxSubQuoExtractor.search(page);
    const test2 : string[][] = await MaxSubQuoExtractor.processPElement(test);
    console.log(test2);   
}

main();


