/**
 * useDataResolver.js
 * 
 * Composable for resolving A2UI BoundValue objects against a data model.
 * Implements the A2UI v0.8 data binding specification.
 * 
 * Supports:
 * - literalString, literalNumber, literalBool
 * - path-based data binding (JSON Pointer style)
 * - Recursive resolution for nested data
 */

import { toValue } from 'vue';

/**
 * Creates a data resolver function for A2UI components
 * @param {Object|Ref} data - The data model (can be a ref or plain object)
 * @returns {Object} Object containing the resolve function
 */
export function useDataResolver(data) {
  /**
   * Resolves a BoundValue object to its actual value
   * 
   * @param {Object|*} valObj - The value object to resolve
   * @param {Object} localData - Optional local data context (for template rendering)
   * @returns {*} The resolved value
   * 
   * @example
   * resolve({ literalString: "Hello" }) // => "Hello"
   * resolve({ path: "/user/name" }) // => value from data model
   * resolve({ literalNumber: 42 }) // => 42
   */
  const resolve = (valObj, localData = null) => {
    // Use localData if provided, otherwise use the main data
    const dataSource = localData !== null ? localData : toValue(data);

    // Handle literal values (A2UI spec: BoundValue types)
    if (valObj?.literalString !== undefined) return valObj.literalString;
    if (valObj?.literalNumber !== undefined) return valObj.literalNumber;
    if (valObj?.literalBool !== undefined) return valObj.literalBool;

    // Handle path-based data binding (JSON Pointer style)
    if (valObj?.path) {
      // Split path by '/' and filter out empty parts
      const parts = valObj.path.split('/').filter(p => p);
      
      // Navigate through the data model
      return parts.reduce((acc, key) => {
        // Return undefined if we can't navigate further
        if (acc === null || acc === undefined) return undefined;
        return acc[key] !== undefined ? acc[key] : undefined;
      }, dataSource);
    }

    // If it's not a BoundValue object, return as-is
    return valObj;
  };

  return {
    resolve
  };
}

