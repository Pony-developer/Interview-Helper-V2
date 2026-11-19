/**
 * Development-only compatibility shim.
 *
 * React 19.2+ logs "changed props" for the Performance panel in dev builds and walks prop
 * objects. react-aria's collection nodes throw from their `childNodes` getter by design,
 * which crashes the commit phase in development (ComboBox/ListBox/TagGroup stop updating).
 * React only reads the value for logging, so returning an empty list is harmless.
 * Production builds don't run that logging and are unaffected.
 */
import { CollectionNode } from "react-aria/private/collections/BaseCollection";

if (process.env.NODE_ENV !== "production") {
  const proto = CollectionNode.prototype as object;
  const desc = Object.getOwnPropertyDescriptor(proto, "childNodes");
  if (desc?.get) {
    Object.defineProperty(proto, "childNodes", { configurable: true, enumerable: false, get: () => [] });
  }
}

export {};
