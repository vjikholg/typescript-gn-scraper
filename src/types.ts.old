interface GroupInfo { 
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


export class PolynomialInfo {
    action: string; 
    polynomial: number[]; // degree = number.length, nth coeff. = polynomial[n-1];
    discriminant: number; 
    
    constructor(action: string, polynomial: number[], discriminant: number) {
        this.action = action; 
        this.polynomial = polynomial, 
        this.discriminant = discriminant; 
    }

    get degree() : number {
        return this.polynomial.length; 
    }
}

export class CharacterTable { 
    class: string[]; 
    size: number[];
    table: string[][]; 

    constructor(c: string[], s: number[], t: string[][]) {
        this.class = c;
        this.size = s;
        this.table = t;
    }
}

interface Series {
    type: string; 
    series: number[]; // keep as ids -> sql: getById, etc., 
}

/**
 * Abstract syntax tree representation of Math nodes which Group Names uses to represent fractions, square roots
 * Doing it this way persists data more easily and translates well into LaTeX
 */

export type MathNode = 
    | {type: 'text'; value: string}
    | {type: 'fraction'; numerator: MathNode; denominator: MathNode}
    | {type: 'sqrt'; value: MathNode}
    | {type: 'sub'; value: MathNode}
    | {type: 'sup'; value: MathNode}
    | {type: 'group'; tag: string, children: MathNode[]}; // represent a math statement which cannot be simplified to a single value, i.e., 1+√5

export type HTMLTags = 'SUB' | 'SUP' | '√' | 'TEXT' | 'FRAC'; 
type TagHandler = ((arg: string) => MathNode) | ((arg1: MathNode, arg2: MathNode) => MathNode); // defines a method-type which takes string -> MathNode<>; 

function MathNodeBuilder(type: string, value: string | MathNode | MathNode[]): MathNode { 
    return {type: type, value: value} as MathNode; 
}

const FractionBuilder: TagHandler = (numerator: MathNode, denom: MathNode) => {
    return {type: "fraction", numerator: numerator, denominator: denom} as MathNode;
}

export const ChildHandler : {[K in HTMLTags]: TagHandler} = {
    'SUB': (s: string) => MathNodeBuilder('sub', s),
    '√': (s: string) => MathNodeBuilder('sqrt', s), 
    'SUP': (s: string) => MathNodeBuilder('sup', s), 
    'TEXT': (s: string) => MathNodeBuilder('text', s), 
    'FRAC': (s: MathNode, q: MathNode) => FractionBuilder(s,q)
}


