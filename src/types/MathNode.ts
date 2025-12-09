/**
 * Abstract syntax tree representation of Math nodes which Group Names uses to represent fractions, square roots
 * Doing it this way persists data more easily and translates well into LaTeX
 */

export interface TextNode {type : 'text', value: string, parent: MathNode};
export interface FracNode {type: 'fraction'; numerator: MathNode; denominator: MathNode, parent: MathNode};
export interface SqrtNode {type: 'sqrt'; value: MathNode, parent: MathNode}; 
export interface SubNode {type: 'sub'; value: MathNode, parent: MathNode}; 
export interface SupNode {type: 'sup'; value: MathNode, parent: MathNode}; 
export interface GroupNode {type: 'group'; tag: string, children: MathNode[], parent: MathNode};

// MathNode types
export type MathNodeTypes = MathNode['type'];
export type MathNode = 
      TextNode
    | FracNode 
    | SqrtNode 
    | SubNode 
    | SupNode 
    | GroupNode // represent a math statement which cannot be simplified to a single value, i.e., 1+√5

export type NodeOf<T extends MathNodeTypes> = Extract<MathNode, {type: T}>; 
export type HTMLTags = 'SUB' | 'SUP' | '√' | 'TEXT' | 'FRAC'; 

type TagHandler = ((text: string) => MathNode) 
| ((arg1: MathNode, arg2: MathNode) => MathNode) // defines a method-type which takes string -> MathNode<>; 
| ((tagArg: string, arg2: MathNode[]) => MathNode)

function MathNodeBuilder(type: string, value: string | MathNode | MathNode[]): MathNode { 
    return {type: type, value: value} as MathNode; 
}

// Function Types
const FractionBuilder : TagHandler = (numerator: MathNode, denom: MathNode) => {
    return {type: "fraction", numerator: numerator, denominator: denom} as MathNode;
}

const GroupBuilder : TagHandler = (tag: string, children: MathNode[]) => {
    return {type: 'group', tag: tag, children: children} as MathNode;
}

// Simple object factory
export const ChildFactory : {[K in MathNodeTypes]: TagHandler} = {
    'sub': (s: string) => MathNodeBuilder('sub', s),
    'sqrt': (s: string) => MathNodeBuilder('sqrt', s), 
    'sup': (s: string) => MathNodeBuilder('sup', s), 
    'text': (s: string) => MathNodeBuilder('text', s), 
    'fraction': (n: MathNode, d: MathNode) => FractionBuilder(n,d),
    'group' : (t: string, mn: MathNode[]) => GroupBuilder(t,mn)
}

/**
 * handle logic of parsing through nodes, hands off processing to parseElement
 * @param parent parent node in question we're recursively parsing through
 * @returns List MathNode[] containing mathnode(s) representing the nested HTML elements - in particular, given parent node, it returns the list of children
 */
export function parseChildren(parent: Node): MathNode[] { 
    const results: MathNode[] = [];                                                 
    parent.childNodes.forEach((child : Node) => {                                   // for each child: 
        // check recursive base case -                                              // 1. if text node -> return MathNode w/ type text
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
export function parseElement(el: HTMLElement, parent? : MathNode): MathNode {
    if (el.tagName === "SPAN" && el.classList.contains("frac")) {
        const sup: HTMLElement | null = el.querySelector("sup"); 
        const sub: HTMLElement | null = el.querySelector("sub"); 

        return {
            type: "fraction", 
            numerator: sup ? parseElement(sup) : {type: "text", value: ''} as MathNode,
            denominator: sub ? parseElement(sub) : {type:"text", value: ''} as MathNode
        } as MathNode; 
    }

    /**
     * <span class="frac">
     *  <sup>-1+
     *      <span>√
     *          <span">-11
     *          </span>
     *      </span>
     *      </sup>
     *      <span>/</span>   
     *   <sub>2
     * </sub>
     * </span>
     */

    if (el.tagName === "SPAN" && el.innerText.trim().startsWith("√")) {     //  
        el.innerText = el.innerText.substring(1);
        return { 
            parent: parent,
            type: "sqrt", 
            value: wrapChildren(parseChildren(el), el.tagName) // if childnode -> always only 1 since 
        } as MathNode                                 // this is due to fact GN uses 2 spans for sqrt 
    }                                                 // one for symbol, other for contents
    // Sub, Sup cases

    if (el.tagName === "SUB") {
        return {
            type: "sub", 
            value: wrapChildren(parseChildren(el), el.tagName)
        } as MathNode
    }

    else if (el.tagName === "SUP") {
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
    if (nodes[0] === undefined) {
        console.log(`broke on a: ${tag}`);
    }

    if (nodes.length === 1) return nodes[0]
    return {
        type: "group", 
        tag: tag, 
        children: nodes
    } as MathNode
}


