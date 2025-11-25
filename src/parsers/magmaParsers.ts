const pattern = /-?\d+/g; 
export function convertMagmaToMatrices({name, order, generators}: {name: String, order: Number, generators: String}) { // generator = magma command, so str 
    const matches = generators.match(pattern); 
    const rawGenerators = []; 
    const data = matches ? matches.map(Number) : [] ;

    let k : number = 1; // k = 1 for Integer(), else k = 2

    let glf : number | undefined = 0; 
    const dim : number | undefined = data[0]; // data[0] = generator dimensions

    if (generators.includes("Integers()")) {
        glf = Number.MAX_SAFE_INTEGER;
        if (data.length === 1) {
            rawGenerators.push([[1]]); // trivial group 
        }
    } else {
        glf = data[1] // data[1] = order of glf of generator
        k = 2; 
    }

    if (dim === null || dim === undefined) throw new Error(`$dim value: {dim} was found to be undefined`); 

    // now for safety tweaks: 
    const matrixSize = dim * dim;
    const errorMargin = (data.length - k) % matrixSize;
    if (errorMargin !== 0) {
        // k += errorMargin;
         throw new Error(
            `Data length ${data.length - k}' + 'is not multiple of ${matrixSize};`
            + ' input string malformation'
        ) 
    }

    while (k < data.length) {           // basically converting a 1d-array -> 2d-array
        let gen = []; 
        for (let i = 0; i < dim; i++) {
            let row = [];
            for (let j = 0; j < dim; j++) { 
                try {
                    row.push(data[k]); 
                    k++;            
                } catch (err) {
                    throw(err); 
                }
         
            }
            gen.push(row); 
        }
        rawGenerators.push(gen);
    }

    return {
        name: name,
        order: order,
        glforder: glf, 
        generators: rawGenerators
    }
}