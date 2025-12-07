import esbuild from 'esbuild'; 

async function main() {
    await esbuild.build({
    entryPoints: ['src/types/MathNode.ts'], 
    bundle: true, 
    format: 'iife', 
    globalName: 'MathNode',
    outfile: 'dist/mathNodeParser.bundle.js',
    }); 
}

main();