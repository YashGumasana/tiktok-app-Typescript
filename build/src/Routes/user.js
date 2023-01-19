"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
//package
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
//route
const validation = __importStar(require("../validation"));
const controllers_1 = require("../controllers");
const jwt_1 = require("../helper/jwt");
// ====   authentication controller 
router.post('/', validation.signUp, controllers_1.userController.signUp);
router.post('/login', validation.login, controllers_1.userController.login);
router.post('/otp_verification', validation.otp_verification, controllers_1.userController.otp_verification);
router.post('/forgot_password', validation === null || validation === void 0 ? void 0 : validation.forgot_password, controllers_1.userController.forgot_password);
router.post('/reset_password', validation === null || validation === void 0 ? void 0 : validation.reset_password, controllers_1.userController.reset_password);
router.get('/get_all_user', controllers_1.userController.get_all_user);
// google , facebook,apple route
// ---Account---
router.get('/', jwt_1.userJWT, controllers_1.userController.get_profile);
router.put('/', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.update_profile, controllers_1.userController.update_profile);
router.get('/delete_account', jwt_1.userJWT, controllers_1.userController.delete_profile);
router.post('/change_password', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.change_password, controllers_1.userController.change_password);
router.post('/logout', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.logout, controllers_1.userController.logout);
//   user controller
router.post('/get', jwt_1.userJWT, jwt_1.userBlock, controllers_1.userController.get_user_pagination);
router.get('/profile/:id', jwt_1.userJWT, jwt_1.userBlock1, controllers_1.userController.get_by_id_user);
router.get('/profilebyusername/:id', jwt_1.userJWT, jwt_1.userBlock2, controllers_1.userController.get_by_username_user);
// follower routes
router.get('/follower/request/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.follower_request);
router.get('/follower/accept_request/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.accept_follower_request);
router.get('/follower/reject_request/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.reject_follower_request);
router.get('/follower/unfollow_user/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.unfollower_user);
router.get('/follower/cancelrequest/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.cancelrequest_user);
router.post('/follower/get/:id', jwt_1.userJWT, controllers_1.userController.get_follower_pagination);
router.post('/following/get/:id', jwt_1.userJWT, controllers_1.userController.get_following_pagination);
router.post('/follower/request/get', jwt_1.userJWT, controllers_1.userController.get_follower_request_pagination);
router.post('/follower/request_sent/get', jwt_1.userJWT, controllers_1.userController.get_follower_request_sent_pagination);
router.delete('/follower/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.delete_follower);
router.get('/follower/pending/count', jwt_1.userJWT, controllers_1.userController.get_pending_follower_request_count);
//  ------   Notification Routes   ------
router.post('/notification/get', jwt_1.userJWT, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.get_notification);
router.post('/notification/delete', jwt_1.userJWT, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.delete_notification);
router.get('/notification', jwt_1.userJWT, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.read_notification);
router.get('/notification/count', jwt_1.userJWT, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.count_notification);
//  ------   Video Routes   ------
router.post('/video', jwt_1.userJWT, validation.add_update_video, controllers_1.userController.add_video);
router.put('/video', jwt_1.userJWT, validation.add_update_video, controllers_1.userController.update_video);
router.post('/video/trend/get', jwt_1.userJWT, jwt_1.userBlock, controllers_1.userController.get_video_by_trending_pagination);
router.delete('/video/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.delete_video);
router.get('/video/like/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.like_video);
router.get('/video/dislike/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.dislike_video);
router.post('/video/get', jwt_1.partialJWT, jwt_1.userBlock, controllers_1.userController.get_video_pagination);
router.post('/video/get_by_tag', jwt_1.userJWT, jwt_1.userBlock, controllers_1.userController.get_video_by_tag_pagination);
router.post('/video/get_by_tag_name', jwt_1.userJWT, jwt_1.userBlock, controllers_1.userController.get_video_by_tag_name_pagination);
router.post('/video/get_by_user', jwt_1.userJWT, controllers_1.userController.get_video_by_user_pagination);
router.post('/video/get_by_user1', jwt_1.userJWT, controllers_1.userController.get_video_by_user_pagination1);
router.get('/video/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.by_id_video);
router.get('/video/share/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.share_video_link);
router.get('/video/view/:id', jwt_1.partialJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.add_count_view_video);
// ------ Job Routes --------
router.post('/job', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.add_update_job, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.add_job);
router.put('/job', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.add_update_job, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.update_job);
router.post('/job/get', jwt_1.userJWT, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.get_job_pagination);
router.get('/job/complete/:id', jwt_1.userJWT, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.complete_job);
router.get('/job/start/:id', jwt_1.userJWT, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.start_job);
router.delete('/job/:id', jwt_1.userJWT, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.delete_job);
// -----Block List ------
router.get('/block/request/:id', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.by_id, controllers_1.userController.block_request);
router.post('/block', jwt_1.userJWT, controllers_1.userController.get_block_pagination);
// -----Enquiry Routes -----
router.post('/enquiry', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.add_update_enquiry, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.add_enquiry);
router.post('/enquiry/get', jwt_1.userJWT, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.get_enquiry_pagination);
router.put('/enquiry', jwt_1.userJWT, validation === null || validation === void 0 ? void 0 : validation.add_update_enquiry, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.update_enquiry);
router.delete('/enquiry/:id', jwt_1.userJWT, controllers_1.userController === null || controllers_1.userController === void 0 ? void 0 : controllers_1.userController.delete_enquiry);
exports.userRouter = router;
//# sourceMappingURL=user.js.map