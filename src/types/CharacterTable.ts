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