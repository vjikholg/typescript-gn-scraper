import { launchBrowser } from "./scraper/browser.js";
import { getGroupLinks } from "./scraper/groupLinks.js";
import { extractMagmaCode, extractOrder } from "./scraper/magmaExtractor.js";
import { convertMagmaToMatrices } from "./parsers/magmaParsers.js";
import { type JsonWriter, writeToJson } from "./utils/writer.js";
import { Page, Browser } from "puppeteer";

// TODO: problems with following groups: 
// C3^3 : C2 
// C2 x Dic6
// C11 : C5     
// the issue appears to be that these groups are returning undefined as their magmacode.


let processed: Set<string> = new Set();  
async function main() {
    const browser: Browser = await launchBrowser(); 
    const page: Page = await browser.newPage(); 
    const {writeFile, close} : JsonWriter = writeToJson(); 

    const groupLinks = await getGroupLinks(browser); 
    console.log(groupLinks);

    let group; 
    for (const groupInfo of groupLinks) {
        if (!processed.has(groupInfo.name)) {                        // checks for duplicate
            processed.add(groupInfo.name);
            await page.goto(groupInfo.href);                         // navigates page to link 
            const magmaCode = await extractMagmaCode(page);          // extracts magma code 

            if (magmaCode) {                                         // if magmaCode exists
                const order = await extractOrder(page)               // extracts correct order from page

                try {
                    group = convertMagmaToMatrices({                 // converts magma code into matrices
                    name: groupInfo.name, 
                    order: order, 
                    generators: magmaCode
                    })
                    await writeFile(group);
                } catch (err) {

                console.log("issue converting group: ") 
                console.log(groupInfo.name); 
                console.log(magmaCode);
                console.error(err)
                continue; 
                }
            }
        }
    }
    close(); 
    await browser.close();
}

main(); 