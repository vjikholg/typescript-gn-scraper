export class FreeGroup { 
    label: string
    characters : string[];
    relations?: RelationChain[]; 

    constructor(label : string, character? : string[], relations? : RelationChain[]) {          
        this.characters = character ?? [];
        this.relations = relations ?? [] ;
        this.label = label;
    }
}

export type Factor = {
    character: string; 
    number: number; 
}

export type Word = Factor[]; 
export type RelationChain = Word[]