"use strict";
var MathNode = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/types/MathNode.ts
  var MathNode_exports = {};
  __export(MathNode_exports, {
    ChildHandler: () => ChildHandler,
    parseChildren: () => parseChildren,
    parseElement: () => parseElement,
    wrapChildren: () => wrapChildren
  });
  function MathNodeBuilder(type, value) {
    return { type, value };
  }
  var FractionBuilder = (numerator, denom) => {
    return { type: "fraction", numerator, denominator: denom };
  };
  var ChildHandler = {
    "SUB": (s) => MathNodeBuilder("sub", s),
    "\u221A": (s) => MathNodeBuilder("sqrt", s),
    "SUP": (s) => MathNodeBuilder("sup", s),
    "TEXT": (s) => MathNodeBuilder("text", s),
    "FRAC": (s, q) => FractionBuilder(s, q)
  };
  function parseChildren(parent) {
    const results = [];
    parent.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim() ?? "";
        if (text) {
          results.push({ type: "text", value: text });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        results.push(parseElement(child));
      }
    });
    return results;
  }
  function parseElement(el) {
    if (el.tagName === "SPAN" && el.classList.contains("frac")) {
      const sup = el.querySelector("sup");
      const sub = el.querySelector("sub");
      return {
        type: "fraction",
        numerator: sup ? parseElement(sup) : { type: "text", value: "" },
        denominator: sub ? parseElement(sub) : { type: "text", value: "" }
      };
    }
    if (el.tagName === "SPAN" && el.innerText.trim().startsWith("\u221A")) {
      return {
        type: "sqrt",
        value: el.hasChildNodes() ? parseChildren(el) : { type: "text", value: el.innerText }
        // if childnode -> always only 1 since 
      };
    }
    if (el.tagName === "SUB") {
      return {
        type: "sub",
        value: wrapChildren(parseChildren(el), el.tagName)
      };
    }
    if (el.tagName === "SUP") {
      return {
        type: "sup",
        value: wrapChildren(parseChildren(el), el.tagName)
      };
    }
    return {
      type: "group",
      tag: el.tagName,
      children: parseChildren(el)
    };
  }
  function wrapChildren(nodes, tag) {
    if (nodes.length === 1) return nodes[0];
    return {
      type: "group",
      tag,
      children: nodes
    };
  }
  return __toCommonJS(MathNode_exports);
})();
