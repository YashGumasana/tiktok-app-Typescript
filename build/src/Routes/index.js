"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const common_1 = require("../common");
const user_1 = require("./user");
const router = (0, express_1.Router)();
exports.router = router;
const accessContorl = (req, res, next) => {
    // console.log(req.originalUrl.split('/')[1]);
    // console.log(req.originalUrl.split('/'));
    // console.log(req.originalUrl);
    req.headers.userType = common_1.userStatus[req.originalUrl.split('/')[1]];
    next();
};
router.use('/user', accessContorl, user_1.userRouter);
//# sourceMappingURL=index.js.map