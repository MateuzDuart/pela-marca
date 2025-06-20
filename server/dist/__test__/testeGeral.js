"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const purify_1 = require("../utils/purify");
const html = "<strong>hello world</strong>";
console.log(purify_1.purify.sanitize(html));
console.log(purify_1.purify.sanitize("<img src=x onerror=alert('img') />"));
console.log(purify_1.purify.sanitize("console.log('hello world')"));
console.log(purify_1.purify.sanitize("<script>alert('hello world')</script>"));
