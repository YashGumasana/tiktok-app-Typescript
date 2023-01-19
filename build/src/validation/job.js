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
exports.add_update_job = void 0;
const joi_1 = __importDefault(require("joi"));
const common_1 = require("../common");
const add_update_job = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        id: joi_1.default.string().error(new Error('id is string!')),
        description: joi_1.default.string().allow(null, "").error(new Error('description is string!')),
        title: joi_1.default.string().allow(null, "").error(new Error('title is string!')),
        location: joi_1.default.string().allow(null, "").error(new Error('location is string!')),
        latitude: joi_1.default.number().error(new Error('latitude is number!')),
        longitude: joi_1.default.number().error(new Error('longitude is number')),
        projectType: joi_1.default.number().error(new Error('projectType is number')),
        status: joi_1.default.number().error(new Error('status is number!')),
        type: joi_1.default.number().error(new Error('type is number!')),
        price: joi_1.default.number().error(new Error('price is number!')),
        duration: joi_1.default.string().allow(null, "").error(new Error('duration is string!')),
        completionTime: joi_1.default.string().allow(null, "").error(new Error('completionTime is string!')),
        skills: joi_1.default.array().error(new Error('skills is array!'))
    });
    schema.validateAsync(req.body).then((result) => __awaiter(void 0, void 0, void 0, function* () {
        return next();
    })).catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}, {}));
    }));
});
exports.add_update_job = add_update_job;
//# sourceMappingURL=job.js.map