// Joins class names and drops falsy values. Classes are not merged, so conditional
// classes must not set the same property as a base class: pick one or the other.
export { clsx as cn, type ClassValue } from "clsx"
