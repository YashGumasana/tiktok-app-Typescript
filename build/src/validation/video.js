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
exports.add_update_video = void 0;
const joi_1 = __importDefault(require("joi"));
const common_1 = require("../common");
const add_update_video = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = joi_1.default.object({
        id: joi_1.default.string().error(new Error('id is string!')),
        description: joi_1.default.string().error(new Error('description is string!')),
        url: joi_1.default.string().error(new Error('url is string!')),
        thumbnail: joi_1.default.string().error(new Error('thumbnail is string! ')),
        setting: joi_1.default.object().error(new Error('settign is object! ')),
        suburb: joi_1.default.string().error(new Error('suburb is string! ')),
        state: joi_1.default.string().error(new Error('state is string! ')),
        city: joi_1.default.string().error(new Error('city is string! ')),
        country: joi_1.default.string().error(new Error('country is string! ')),
        latitude: joi_1.default.number().error(new Error('latitude is number! ')),
        longitude: joi_1.default.number().error(new Error('longitude is number! ')),
        tag: joi_1.default.array().error(new Error('tag is array! ')),
    });
    schema.validateAsync(req.body).then((result) => __awaiter(void 0, void 0, void 0, function* () {
        return next();
    })).catch((error) => __awaiter(void 0, void 0, void 0, function* () {
        res.status(400).json(new common_1.apiResponse(400, error.message, {}, {}));
    }));
});
exports.add_update_video = add_update_video;
//# sourceMappingURL=video.js.map