"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const src_1 = __importDefault(require("./src"));
const port = process.env.PORT || 80;
src_1.default.listen(port, () => {
    console.log(`server started on port ${port}.....`);
});
