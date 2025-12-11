import { Page, ElementHandle } from 'puppeteer'
import { Vertex, Edge } from '../types/GraphTheory';


/**
 * Grab node information off groupnames, and export into format readable by force-graph or D3.js
 * TODO - Globally we need to define a Map<string, GroupInfo>, which returns references by raw-label 
 * I.e., raw innerHTML from HTMLelem in question 
 * Actually since we're scraping group-names as MathNodes, it'll be more useful returning GroupInfo
 *  
 */

const Regex : RegExp = /(M)(\d+?.\d+?|\d+) (\d+?.\d+) (L)(\d+?.\d+?) (\d+.\d+)/ // incomplete but we'll use as placeholder for now

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

        const path : SVGPathElement = await rawpath.evaluate((elem : SVGPathElement) => {
            return elem;
        })
        return path;
    } 

    static processPathElement(paths: SVGPathElement) { 
        const rawHTML : string = paths.innerHTML; // SVGPathElement.getPathData() isn't working, use regex + innerHTML
        // kind of impossible without getPathData() :\
        
        

    }

    static async vertexGrabber(svd : ElementHandle<Element>) : Promise<Vertex[]> { 
        const vtc : Vertex[] = [];
        const subgroups : ElementHandle<HTMLElement> = svd.$$('.nSg .cSg')
        
        for (const subgroup of subgroups) { 
            // scrapes top to bottom - sub1 -> sub2 -> ... 
            // decide what we want label to be; do we want vertex to hold info?    
            // const subgroup = subgroups[i]; 

            const style : CSSStyleDeclaration = await subgroup.$eval((elem : HTMLElement) => { 
                // grab styling 
                return elem.style as CSSStyleDeclaration;
            }); 

            const left : string = style.left; 
            const top : string = style.top; 
            // assign anchor as label for now
            
            const label : string = subgroup.$eval('a', (el : HTMLAnchorElement) => { 
                return el.innerText.trim();
            })
            // we'll need to get id = sub{i} -> link information from subdesc and proper highlighting within D3-force 
            vtc.push({label: label, x: left, y: top} as Vertex); 
        }
        return vtc;
    }



}