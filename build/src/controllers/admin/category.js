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
Object.defineProperty(exports, "__esModule", { value: true });
exports.add_category = void 0;
const helper_1 = require("../../helper");
// import { deleteImage, responseMessage } from '../../helper'
const mongoose_1 = require("mongoose");
// import async from 'async'
const ObjectId = mongoose_1.Types.ObjectId;
const add_category = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, helper_1.reqInfo)(req);
    try {
        let response, alreadyExist, body = req.body, search = new RegExp(`^${body}`);
    }
    catch (error) {
    }
});
exports.add_category = add_category;
//# sourceMappingURL=category.js.map