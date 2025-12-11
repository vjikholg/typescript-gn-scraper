/**
 * Rudimentary Graph-Theory library sufficient to represent data to be exported to D3-force or similar.     
 */

export type Vertex = {
    label? : string | number; // we'll assign this by raw label - later on we'll organize groups by id (in order of which they're scraped) - should save memory 
    x: string | number; 
    y: string | number; 
};

export type Vertices = Vertex[]

export type Edge = { // ts passes obj by reference in creation - pseudo pter
    v1: Vertex; 
    v2: Vertex; 
};


export type Edges = Edge[]; 

export type Graph = {
    vtc: Vertex[]
    edge: Edge
}

export type RawEdge = {
    x1: number
    y1: number
    x2: number
    y2: number
}