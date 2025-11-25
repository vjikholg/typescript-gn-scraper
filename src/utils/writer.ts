import fs from 'fs'; 
let rowsWritten : number = 0;
let MAX_ROWS : number = 100000; 

export type JsonWriter<T = unknown> = { 
    writeFile: (g: T) => Promise<void>; 
    close: () => Promise<void>; 
}

export function writeToJson(path = './output/output.json') : JsonWriter {
    const file : fs.WriteStream = fs.createWriteStream(path); 

    file.on('error', err => { // error listener - avoid infinite write 
        console.error('stream error: ', err); 
    })

    file.write('[\n'); 
    let first : boolean = true; 

    async function writeFile(g: any) { // stringify cant handle the large nature of generators
        if (rowsWritten++ > MAX_ROWS) throw new Error(`refusing to write - ${MAX_ROWS} limit reached`); 
        let data: string;
        return new Promise<void>((resolve) => { // weird stack exchange magic... at least im learning about resolving backpressure 
            try {
                data = JSON.stringify(g);
                if (data === undefined) throw new Error (`Could not serialize object (circular reference?) ${g}`); 

                const chunk : string = (first ? '' : ',\n') + data; 
                first = false;
    
            if (!file.write(chunk)) {
                file.once('drain', () => resolve);
            } else {
                resolve; 
            }

            console.log("writing: " + data + " to file");

            } catch(err) {
                console.log("ran into error with: " + data);
                console.error(err);
                resolve; 
            }  
        })
    }

    function close() {
        file.write('\n]\n'); 
        file.end();
        return new Promise<void>(res => file.on('finish', () => res())); 
    }

    return {writeFile, close} as JsonWriter;
    
}