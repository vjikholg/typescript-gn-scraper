import { launchBrowser } from "../scraper/browser";
import { extractMagmaCode, extractOrder, extractName} from "../scraper/magmaExtractor"; 
import { jest, test, expect } from "@jest/globals";


jest.setTimeout(30_000); 

const c4 = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C4.html"; 

const c33c2 = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C3%5E3sC2.html"; 
const c2dic6 = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C2xDic6.html"; 
const c11c5 = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/C11sC5.html";
const q8 = "https://people.maths.bris.ac.uk/~matyd/GroupNames/1/Q8.html"

test('grabbing quaternion q8 should return correct name', async() => {
    const browser = await launchBrowser(); 
    const page = await browser.newPage(); 
    await page.goto(q8)
    
    const test = await extractName(page);  
    expect(test).toEqual("Quaternion group");
})


test('extracting c4 should return order 4 and correct magma code', async() => { 
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.goto(c4, {waitUntil: "domcontentloaded"}); 
    
    const magma = await extractMagmaCode(page);
    const order = await extractOrder(page);
    browser.close();
    expect(magma).toEqual("G:=sub<GL(1,GF(5))| [2] >"); 

    expect(order).toEqual(4); 
})

test('checking C3^3:C2 - ', async() => {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.goto(c33c2, {waitUntil: "domcontentloaded"}); 
    
    const magma = await extractMagmaCode(page);
    const order = await extractOrder(page);
    browser.close();
    expect(magma).toEqual("G:=sub<GL(6,Integers())| " + 
        "[0,-1,0,0,0,0,1,-1,0,0,0,0,0,0,-1,1,0,0,0,0,-1,0,0,0,0,0,0,0,-1,1,0,0,0,0,-1,0]," + 
        "[1,0,0,0,0,0,0,1,0,0,0,0,0,0,-1,1,0,0,0,0,-1,0,0,0,0,0,0,0,0,-1,0,0,0,0,1,-1]," +
        "[1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,-1,0,0,0,0,1,-1,0,0,0,0,0,0,0,-1,0,0,0,0,1,-1]," +
        "[1,-1,0,0,0,0,0,-1,0,0,0,0,0,0,0,-1,0,0,0,0,-1,0,0,0,0,0,0,0,-1,0,0,0,0,0,-1,1] >");

    expect(order).toEqual(54); 
}) 

test('checking C2:dic6', async() => { 
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.goto(c2dic6, {waitUntil: "domcontentloaded"}); 
    
    const magma = await extractMagmaCode(page);
    const order = await extractOrder(page);
    browser.close();
    expect(magma).toEqual("G:=sub<GL(5,GF(13))| [12,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],"+ 
        "[1,0,0,0,0,0,4,0,0,0,0,0,10,0,0,0,0,0,12,10,0,0,0,5,1],"+
        "[12,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,6,1,0,0,0,2,7] >"); 

    expect(order).toEqual(48); 
})

test('checking c11c5', async() => { 
    const browser = await launchBrowser();
    const page = await browser.newPage();
    await page.goto(c11c5, {waitUntil: "domcontentloaded"}); 
    
    const magma = await extractMagmaCode(page);
    const order = await extractOrder(page);
    browser.close();
    expect(magma).toEqual("G:=sub<GL(5,GF(3))|" +
        " [2,2,2,0,2,2,2,1,1,1,2,1,0,1,2,0,1,0,0,0,0,1,2,1,1]," +
        "[1,0,0,0,0,0,0,0,1,0,2,2,1,1,1,0,0,1,0,0,0,1,2,1,1] >"); 

    expect(order).toEqual(55); 
})