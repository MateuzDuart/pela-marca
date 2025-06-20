import { purify } from "../utils/purify";

const html = "<strong>hello world</strong>";
console.log(purify.sanitize(html));
console.log(purify.sanitize("<img src=x onerror=alert('img') />"));
console.log(purify.sanitize("console.log('hello world')"));
console.log(purify.sanitize("<script>alert('hello world')</script>"));