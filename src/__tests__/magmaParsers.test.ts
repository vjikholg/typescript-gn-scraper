import { convertMagmaToMatrices } from "../parsers/magmaParsers"; 
import { jest, test, expect } from "@jest/globals";


test('C2 x Dic6 bug should return proper matrices. ', () => { 
    const str = "G:=sub<GL(5,GF(13))| [12,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],[1,0,0,0,0,0,4,0,0,0,0,0,10,0,0,0,0,0,12,10,0,0,0,5,1],[12,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,6,1,0,0,0,2,7] >;"; 
    const g1 = [
        [12,0,0,0,0],
        [ 0,1,0,0,0],
        [ 0,0,1,0,0],
        [ 0,0,0,1,0],
        [ 0,0,0,0,1]];

    const g2 = [
        [1,0,0,0,0],
        [0,4,0,0,0],
        [0,0,10,0,0],
        [0,0,0,12,10],
        [0,0,0,5,1]]
    
    const g3 = [
        [12,0,0,0,0],
        [0,0,1,0,0],
        [0,1,0,0,0],
        [0,0,0,6,1],
        [0,0,0,2,7]]

    const expected = [g1, g2, g3]; 

    const result = convertMagmaToMatrices({
        name: 'C2 x Dic6', 
        order: 48, 
        generators: str
    });

    expected.forEach((mat, idx) => {
        expect(result.generators[idx]).toEqual(mat); 
    })

    expect(result.glforder).toBe(13); 
    expect(result.order).toBe(48);

})

