/**
 * Abstract syntax tree representation of Math nodes which Group Names uses to represent fractions, square roots
 * Doing it this way persists data more easily and translates well into LaTeX
 */


export type MathNode = 
    | {type: 'text'; value: string}
    | {type: 'fraction'; numerator: MathNode; denominator: MathNode}
    | {type: 'sqrt'; value: MathNode}
    | {type: 'sub'; value: MathNode}
    | {type: 'sup'; value: MathNode}
    | {type: 'group'; tag: string, children: MathNode[]}; // represent a math statement which cannot be simplified to a single value, i.e., 1+√5

export type HTMLTags = 'SUB' | 'SUP' | '√' | 'TEXT' | 'FRAC'; 
type TagHandler = ((arg: string) => MathNode) | ((arg1: MathNode, arg2: MathNode) => MathNode); // defines a method-type which takes string -> MathNode<>; 

function MathNodeBuilder(type: string, value: string | MathNode | MathNode[]): MathNode { 
    return {type: type, value: value} as MathNode; 
}

const FractionBuilder: TagHandler = (numerator: MathNode, denom: MathNode) => {
    return {type: "fraction", numerator: numerator, denominator: denom} as MathNode;
}

export const ChildHandler : {[K in HTMLTags]: TagHandler} = {
    'SUB': (s: string) => MathNodeBuilder('sub', s),
    '√': (s: string) => MathNodeBuilder('sqrt', s), 
    'SUP': (s: string) => MathNodeBuilder('sup', s), 
    'TEXT': (s: string) => MathNodeBuilder('text', s), 
    'FRAC': (s: MathNode, q: MathNode) => FractionBuilder(s,q)
}


/**
 * handle logic of parsing through nodes, hands off processing to parseElement
 * @param parent parent node in question we're recursively parsing through
 * @returns List MathNode[] containing mathnode(s) representing the nested HTML elements - in particular, given parent node, it returns the list of children
 */
export function parseChildren(parent: Node): MathNode[] { 
    const results: MathNode[] = [];                                                 
    parent.childNodes.forEach((child) => {                                          // for each child: 
        // check recursive base case - text or empty node                           // 1. if text node -> return MathNode w/ type text
        if (child.nodeType === Node.TEXT_NODE) {                                    // 2. if element node, i.e., <td><span ... > </td>, determine span class
            const text : string = child.textContent?.trim() ?? ''; // safety        //  2a. if fraction -> look at parseChildren <sup>, <sub> elems 
            if (text) {                                                             //  2b. if sqrt -> 
                results.push({type: "text", value: text} as MathNode); 
            }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            results.push(parseElement(child as HTMLElement) as MathNode); 
        }
    })
    return results;
}

/**
* Handles the logic mapping HTMLElement -> MathNodes
* If detect children in el: HTMLElement, hands off further parsing back to parseChildren. 
* 
* @param el 
* @returns 
*/
export function parseElement(el: HTMLElement): MathNode {
    if (el.tagName === "SPAN" && el.classList.contains("frac")) {
        const sup: HTMLElement | null = el.querySelector("sup"); 
        const sub: HTMLElement | null = el.querySelector("sub"); 
        return {
            type: "fraction", 
            numerator: sup ? parseElement(sup) : {type: "text", value: ''} as MathNode,
            denominator: sub ? parseElement(sub) : {type:"text", value: ''} as MathNode
        } as MathNode; 
    }

    // Sqrt: <sup> 1- <span>√<span> -15 </span></span> </sup>
    if (el.tagName === "SPAN" && el.innerText.trim().startsWith("√")) {     //  
        return { 
            type: "sqrt", 
            value: (el.hasChildNodes()) ? 
                parseChildren(el) : 
                {type: "text", value: el.innerText}   // if childnode -> always only 1 since 
        } as MathNode                                 // this is due to fact GN uses 2 spans for sqrt 
    }                                                 // one for symbol, other for contents
    // Sub, Sup cases

    if (el.tagName === "SUB") {
        return {
            type: "sub", 
            value: wrapChildren(parseChildren(el), el.tagName)
        } as MathNode
    }

    if (el.tagName === "SUP") {
        return {
            type: "sup", 
            value: wrapChildren(parseChildren(el), el.tagName)
        } as MathNode
    }

    // Fallback group node: 
    return {
        type: "group", 
        tag: el.tagName, 
        children: parseChildren(el)
    } as MathNode
}

/**
 * Consumes MathNode[] and returns MathNode of type group
 * @param nodes 
 * @param tag 
 * @returns 
 */
export function wrapChildren(nodes: MathNode[], tag: string) : MathNode { 
    if (nodes.length === 1) return nodes[0]
    return {
        type: "group", 
        tag: tag, 
        children: nodes
    } as MathNode
}


