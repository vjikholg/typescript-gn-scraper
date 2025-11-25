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