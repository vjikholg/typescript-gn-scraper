import puppeteer from "puppeteer";
import { Page } from "puppeteer"

const selector = ['#shs5', '.shs5', '.shs6', 'pre', "#textmat", "#shs6"];


export async function extractMagmaCode(page: Page): Promise<String | null> {
    for (const filter of selector) { 
        const magma = await page.evaluate((filter) => {
            const temp: any = document.querySelector(filter);
            if (!temp) {
                return null; 
            }

            if (temp.innerText.includes('sub<GL') ) {
                const idx = temp.innerText.indexOf('G:='); 
                // if (idx === -1); // nothing useful 
                return temp.innerText.slice(idx).trim(); 
            } else {
                console.log(temp.innerText);
                return null; 
            }
        }, filter); // today i learnt!
        
        if (magma) {
            return magma.split(';')[0]; // removes everything after ';', unneeded. 
        }   
    }
    return null; 
}

export function unicodeToLatex(txt: string) : string {
    const sub: { [key: string]: string } = { '₀':'_0','₁':'_1','₂':'_2','₃':'_3','₄':'_4',
                   '₅':'_5','₆':'_6','₇':'_7','₈':'_8','₉':'_9' };
                   
    const sup:{[key: string] : string} = { '⁰':'^0','¹':'^1','²':'^2','³':'^3','⁴':'^4',
                   '⁵':'^5','⁶':'^6','⁷':'^7','⁸':'^8','⁹':'^9' };
  
    return txt
        .replace(/[₀-₉]/g, ch => sub[ch] || ch)          // subscripts
        .replace(/[⁰-⁹]/g, ch => sup[ch] || ch)          // superscripts
        .replace(/×/g, '\\times')
        .replace(/⋊/g, '\\rtimes')
        // optional: glue base letter and _ / ^ with no space
        .replace(/ ([\^_])/g, '$1');
    }

export function labelToLatex(label: string) : string {
        return label
          // C3   -> C_{3}
          .replace(/([A-Za-z])(\d+)/g, '$1_{$2}')
          // ^3   -> ^{3}
          .replace(/\^(\d+)/g, '^{\$1}')
          // : or :_k  -> \rtimes  (assumes only one colon)
          .replace(':', '\\rtimes ');
      }


export async function extractName(page : Page) {
    let rawName = await page.$eval('.gpdescstyle', (el) => el.textContent.trim()); 
    return unicodeToLatex(rawName);
}

export async function extractLabel(page : Page) {
    let rawLabel = await page.$eval('.gpordstyle', (el) => el.textContent.trim());
    return unicodeToLatex(rawLabel);
}


export async function extractOrder(page : Page) { 
    const orderText: any =  await page.evaluate( () => {
        const temp = document.querySelector(".gpordstyle"); 
        if (temp) {
            return temp.textContent.trim();
        } else {
            return null; 
        }
    })

    console.log(orderText); 
    return parseInt(orderText.match(/\d+/)[0], 10);
}
