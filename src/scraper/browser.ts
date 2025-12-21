import puppeteer from 'puppeteer';
import { Browser, Page } from 'puppeteer';
import path from 'path';

let ScriptInjected : boolean = false;  

export async function launchBrowser() : Promise<Browser> {
    return await puppeteer.launch({ headless: false , browser: "firefox"});
}

export async function ScriptInjection(page : Page) {
    await page.addScriptTag({
        path: path.join(__dirname, '../../dist/MathNodeParser.bundle.js')
    })

} 