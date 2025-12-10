export type Vertex = {}; 
export type Edge = Vertex[][] 

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