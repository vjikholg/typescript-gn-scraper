import {Browser, ElementHandle, Page } from "puppeteer";
import { launchBrowser } from "./browser";

export class NavExtractors { 
    static async getNavbar(page: Page) : Promise<ElementHandle<HTMLLIElement>[]> {
        const navbar : ElementHandle<HTMLLIElement>[] | null = await page.$$("nav ul li")
        if (!navbar) throw new Error(`no navbar at link: ${page.url()}`);
        console.log(navbar); 
        return navbar; 
    }
}

async function main() { 
    const browser : Browser = await launchBrowser();
    const page : Page = await browser.newPage(); 
    await (page.goto("https://people.maths.bris.ac.uk/~matyd/GroupNames/1/D5.html"))
    NavExtractors.getNavbar(page); 
}

main();


