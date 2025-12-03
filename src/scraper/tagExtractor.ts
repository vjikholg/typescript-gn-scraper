import { ElementHandle, Page } from "puppeteer";

class TagExtractor { 
    static async grabTags(paragraphElem : ElementHandle<HTMLParagraphElement>) : Promise<string[]> { 
        const tags : string[] = await paragraphElem.$$eval('a', (list : HTMLAnchorElement[]) => { 
            return list.map((elem) => elem.innerText.trim()); 
        })
        return tags; 
    }
}