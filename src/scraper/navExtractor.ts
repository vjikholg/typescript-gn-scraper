import { Browser, ElementHandle, Page } from "puppeteer";
import { launchBrowser } from "./browser";
import { MathNode } from "../types/MathNode";
    

const NavbarTypes : string[] = ["label", "centre" , "frattini" , "sylow" , "aut g" , "out g"]; 
const NavbarLabels : Set<string> = new Set(NavbarTypes);
const SylowRegex : RegExp = /\d+/;
type Sylow = {n: Number, p: Number}

/** Contains methods that scrape information from the "navigation" bar component on GN. 
 * Information includes: 
 * Label: C4, D5, C4:C2, etc.,  
 * Z(G), Iota(G)
 * Sylow Subgroups - Number, Order, Label
 * Aut(G), Out(G)
 */
export class NavExtractors { 
    
    static async  getNavbar(page: Page) : Promise<ElementHandle<HTMLUListElement>> {
        const navbar : ElementHandle<HTMLUListElement> | null = await page.$("nav ul")
        if (!navbar) throw new Error(`no navbar at link: ${page.url()}`);
        return navbar; 
    }

    static async navbarProcess(navbar : ElementHandle<HTMLUListElement>) : Promise<Record<string, any>> {
        const navlist: ElementHandle<HTMLLIElement>[] = await navbar.$$('li') 
        const processed : Record<string, any> = {}; 
        
        for (let i = 0; i < navlist.length; i++) { 
            const innerText : string = await navlist[i].evaluate((elem : HTMLLIElement) => { 
                return elem.innerText.trim().toLowerCase(); 
            })

            if (NavbarLabels.has(innerText)){ 
                const nextElem : ElementHandle<HTMLElement> = navlist[i+1]; 
                if (innerText !== "sylow") {
                    const text : string = await nextElem.evaluate((elem : HTMLElement) => { 
                        return elem.innerText.trim(); 
                    })

                    const href : string | null = await nextElem.evaluate((elem : HTMLElement) => { 
                        if (elem.children[0].tagName.trim().toLowerCase() === "a") {
                            return elem.children[0].getAttribute('href')!.substring(4); 
                        }
                        return "" })

                    const textAndLink : (string | null)[] = [text, href];
                    processed[innerText] = textAndLink; 
                } else { // sylow subgroups -> regex to find n, p
                    const rawnums: string[] = await nextElem.evaluate((elem : HTMLElement) => { 
                        const matches : RegExpExecArray[] = Array.from(elem.innerText.matchAll(SylowRegex));
                        return matches.map(match => match[1]);
                    })
                    const nums : Number[] = rawnums.map((str) => parseInt(str));
                    const sylow : Sylow = { n: nums[0], p: nums[1] } as Sylow; 
                    // next, push into existing sylow record or create new. 

                    if (processed.hasOwnProperty('sylow')) {
                        processed.sylow.push(sylow); 
                    } else {
                        processed.sylow = [sylow];
                    } // now sylow kept as an array 
                } 
            }
        }
        console.log(processed);
        return processed;
    }

}

// async function main() { 
//     const browser : Browser = await launchBrowser();
//     const page : Page = await browser.newPage(); 
//     await (page.goto("https://people.maths.bris.ac.uk/~matyd/GroupNames/1/D5.html"))
//     const test = await NavExtractors.getNavbar(page); 
//     await NavExtractors.navbarProcess(test);
// 
// }
// 
// main();


