interface Series {
    seriesByID?: number[]; // keep as ids -> sql: getById, etc., 
    seriesByLabel: string[];
}

export class DerivedSeries implements Series { 
    seriesByID?: number[]
    seriesByLabel: string[]; 
    constructor(labels: string[]) { 
        this.seriesByLabel = labels; 
    } 
}

export class ChiefSeries implements Series { 
    seriesByID?: number[]
    seriesByLabel: string[]; 
    constructor(labels: string[]) { 
        this.seriesByLabel = labels; 
    } 
}

export class UpperCentralSeries implements Series {
    seriesByID?: number[]
    seriesByLabel: string[]; 
    constructor(labels: string[]) { 
        this.seriesByLabel = labels; 
    } 
}

export class LowerCentralSeries implements Series { 
    seriesByID?: number[]
    seriesByLabel: string[]; 
    constructor(labels: string[]) { 
        this.seriesByLabel = labels; 
    } 
}

export class JenningsSeries implements Series { 
    seriesByID?: number[]; 
    seriesByLabel: string[];
    constructor(labels: string[]) { 
        this.seriesByLabel = labels; 
    }
}

type SeriesTypes = 'DERIVED SERIES' | 'CHIEF SERIES' | 'JENNINGS' | 'UPPER CENTRAL' | 'LOWER CENTRAL';  
type SeriesConstructor = (arg: string[]) => Series

const SeriesFactory : {[K in SeriesTypes] : SeriesConstructor} = {
    'DERIVED SERIES': (s: string[]) => new DerivedSeries(s), 
    'CHIEF SERIES': (s: string[]) => new ChiefSeries(s), 
    'JENNINGS': (s: string[]) => new UpperCentralSeries(s), 
    'UPPER CENTRAL': (s: string[]) => new LowerCentralSeries(s), 
    'LOWER CENTRAL': (s: string[]) => new JenningsSeries(s)
}

export function SeriesHandler(label: string) : SeriesConstructor { 
    label = label.toUpperCase().trim(); 
    return SeriesFactory[label as SeriesTypes];
}
