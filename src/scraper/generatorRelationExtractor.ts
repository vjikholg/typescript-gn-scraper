import { Page, ElementHandle } from "puppeteer";
import { FreeGroup, Factor, Word, RelationChain } from "../types/FreeGroup";
import { NavExtractor } from "./NavExtractor";

const reg : RegExp = /([A-Za-z])(\d*)/g


// 'Generators and relations for C8○D4\n G = < a,b,c | a8=c2=1, b2=a4, ab=ba, ac=ca, cbc=a4b >'
export class GeneratorRelationExtractor { 
    static async search(page : Page) : Promise<string> { 
        const paragraphs : ElementHandle<HTMLParagraphElement>[] = (await page.$$('p'))
        .filter((elemhandle : ElementHandle<HTMLParagraphElement>) => { 
            return elemhandle.evaluate((p : HTMLParagraphElement) => { 
                return p.innerText.includes('Generators and relations');
            }); 
        })

        if (paragraphs.length === 0) throw new Error(`no gen/relations on this page!: ${page.url()}`); 

        const paragraph : string = await paragraphs[0].evaluate((p : HTMLParagraphElement) => {
            return p.innerText;
        })
        return paragraph; 
    }

    static process(paragraph: string, label: string) { 
        const lbracket : number = paragraph.search(/</)
        const separator : number = paragraph.search(/\|/)
        const characters : string = paragraph.substring(lbracket, separator)
        
        
        // format: [a8=c2=1, b2=a4, ab=ba, ...]
        const relations : string[] = paragraph
        .substring(separator+1, paragraph.length-2)
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean) 
        
        const letters : string[] = Array.from(characters.matchAll(/[a-z]/))
            .map((match : RegExpExecArray) => {
                return match[0]
            });
        
        
        // format: [[a8,c2,1], [b2,a4], [ab,ba], ..., [cbc, a4b]]
        const rawChains : string[][] = relations.map((chain: string) => {
            return chain.split('=')
            .map((s : string) => s.trim())
            .filter(Boolean)
        })

        const processed : RelationChain[] = rawChains.map((relation: string[]) => {
            return relation.map((word: string) => {
                return this.parseWord(word)
            }) as RelationChain
        })

        return new FreeGroup(label, letters, processed);
    }
    
    private static parseWord(raw: string) : Word {
        const s = raw.trim(); 
        let match: RegExpExecArray | null; 

        const factors : Factor[] = []

        while (match = reg.exec(s)) { 
            const [, char, powerStr] = match;
            const power = powerStr ? parseInt(powerStr, 10) : 1; 
            factors.push({character: char, number: power} as Factor)
        }

        return factors as Word; 
    }
}