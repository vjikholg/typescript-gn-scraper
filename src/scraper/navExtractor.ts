import { Browser, ElementHandle, Page } from "puppeteer";
import { launchBrowser } from "./browser";

export class NavExtractors { 
    static async getNavbar(page: Page) : Promise<ElementHandle<HTMLUListElement>> {
        const navbar : ElementHandle<HTMLUListElement> | null = await page.$("nav ul")
        if (!navbar) throw new Error(`no navbar at link: ${page.url()}`);
        return navbar; 
    }

    static async navbarProcess(navbar : ElementHandle<HTMLUListElement>) {
        const list : any[] = await navbar.$$eval('li', li => { 
            return li.map((li) => {
                text: li.innerText; 
                html: li.innerHTML; 
                url: li.getAttribute('href'); // might be null
            });
        })
        console.log(list); 
        return list;
    }

}

async function main() { 
    const browser : Browser = await launchBrowser();
    const page : Page = await browser.newPage(); 
    await (page.goto("https://people.maths.bris.ac.uk/~matyd/GroupNames/1/D5.html"))
    NavExtractors.getNavbar(page); 

}

main();


