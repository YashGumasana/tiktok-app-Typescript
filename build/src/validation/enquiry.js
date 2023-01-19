"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.add_update_enquiry = void 0;
const joi_1 = __importDefault(require("joi"));
const common_1 = require("../common");
const add_update_enquiry = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        id: joi_1.default.string().error(new Error('id is string!')),
        question: joi_1.default.string().allow(null, "").error(new Error('question is string!')),
        answer: joi_1.default.string().allow(null, "").error(new Error('answer is string!')),
        jobId: joi_1.default.string().allow(null, "").error(new Error('jobId is string'))
    });
    schema.validateAsync(req.body).then((result) => __awaiter(void 0, void 0, void 0, function* () {
        return next();
    })).catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}, {}));
    }));
});
exports.add_update_enquiry = add_update_enquiry;
//# sourceMappingURL=enquiry.js.map