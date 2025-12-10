import {Page, ElementHandle} from 'puppeteer'
import { Vertex } from '../types/GraphTheory';


/**
 * Grab node information off groupnames, and export into format readable by force-graph or D3.js
 */
export class SVGScraper { 
    static async search(page : Page) : Promise<ElementHandle<Element>> { 
        const svd : ElementHandle<Element> | null = await page.$('.svd')
        if (!svd) { 
            throw new Error(`This page has no SVDElement to grab a subgroup-decomposition off of!: ${page.url()}`)
        }
        return svd; 
    }

    static async pathElementGrabber(elem : ElementHandle<HTMLElement>) : Promise<SVGPathElement> { 
        const svg : ElementHandle<SVGSVGElement> = (await elem.$('svg'))!; 
        const rawpath : ElementHandle<SVGPathElement> = (await svg.$('path'))!;

        if (!rawpath) { 
            throw new Error(`Something went wrong scraping SVGPathElement`)
        }

        const path : SVGPathElement = await rawpath.evaluate((elem) => {
            return elem;
        })
        return path;
    } 

    static processPathElement(paths: SVGPathElement) { 

    }

    static async vertexGrabber(svd : ElementHandle<Element>) : Promise<Vertex[]> { 
        const vtc : Vertex[] = [];
        const subgroups : any = svd.$$('.nsg .csg')
        
        return vtc;

    }



}