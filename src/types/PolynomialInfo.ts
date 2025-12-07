import { MathNode } from "./MathNode";

export class PolynomialInfo {
    action: string; 
    polynomial: number[]; // degree = number.length, nth coeff. = polynomial[n-1];
    discriminant: number; 
    
    constructor(action: string, polynomial: number[], discriminant: number) {
        this.action = action;              // i.e., 4T3, 8T4
        this.polynomial = polynomial,      // x^4 + 2 = [1,0,0,0,2]
        this.discriminant = discriminant; 
    }

    get degree() : number {
        return this.polynomial.length; 
    }
}