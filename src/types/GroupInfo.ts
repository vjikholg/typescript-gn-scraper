import { PolynomialInfo } from "./PolynomialInfo";
import { Series } from "./Series";
import { CharacterTable } from "./CharacterTable";

export type GroupInfo = { 
    name: string; 
    id: number;
    aliases?: string[] 
    order: number; 
    properties: string[];
    generators: number[][][]; 
    maximalSubgroup: number[];
    minimalSubgroup: number[];
    polynomialInfo: PolynomialInfo[];  
    series: Series[]; 
    charTable: CharacterTable; 
    conjugacyTable: any[] // temp
}