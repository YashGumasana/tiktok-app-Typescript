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
// "db_url": "mongodb+srv://YashGumasana:9879445325120@nodeexpressprojects.nmkks8r.mongodb.net/SAMPLE_PROJECT_TS"
//# sourceMappingURL=server.js.map