import puppeteer from 'puppeteer';
import { Browser } from 'puppeteer';

export async function launchBrowser() : Promise<Browser> {
    return await puppeteer.launch({ headless: false });
}