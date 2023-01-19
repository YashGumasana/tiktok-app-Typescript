//package
import express from 'express'
const router = express.Router()

//route
import * as validation from '../validation'
import { userController } from '../controllers'
import { userJWT, userBlock, userBlock1, userBlock2, partialJWT } from '../helper/jwt'

// ====   authentication controller 
router.post('/', validation.signUp, userController.signUp)
router.post('/login', validation.login, userController.login)
router.post('/otp_verification', validation.otp_verification, userController.otp_verification)
router.post('/forgot_password', validation?.forgot_password, userController.forgot_password)
router.post('/reset_password', validation?.reset_password, userController.reset_password)

router.get('/get_all_user', userController.get_all_user)
// google , facebook,apple route

// ---Account---
router.get('/', userJWT, userController.get_profile)
router.put('/', userJWT, validation?.update_profile, userController.update_profile)
router.get('/delete_account', userJWT, userController.delete_profile)
router.post('/change_password', userJWT, validation?.change_password, userController.change_password)
router.post('/logout', userJWT, validation?.logout, userController.logout)

//   user controller
router.post('/get', userJWT, userBlock, userController.get_user_pagination)
router.get('/profile/:id', userJWT, userBlock1, userController.get_by_id_user)
router.get('/profilebyusername/:id', userJWT, userBlock2, userController.get_by_username_user)

// follower routes
router.get('/follower/request/:id', userJWT, validation?.by_id, userController.follower_request)
router.get('/follower/accept_request/:id', userJWT, validation?.by_id, userController.accept_follower_request)
router.get('/follower/reject_request/:id', userJWT, validation?.by_id, userController.reject_follower_request)
router.get('/follower/unfollow_user/:id', userJWT, validation?.by_id, userController.unfollower_user)
router.get('/follower/cancelrequest/:id', userJWT, validation?.by_id, userController.cancelrequest_user)

router.post('/follower/get/:id', userJWT, userController.get_follower_pagination)
router.post('/following/get/:id', userJWT, userController.get_following_pagination)
router.post('/follower/request/get', userJWT, userController.get_follower_request_pagination)
router.post('/follower/request_sent/get', userJWT, userController.get_follower_request_sent_pagination)
router.delete('/follower/:id', userJWT, validation?.by_id, userController.delete_follower)
router.get('/follower/pending/count', userJWT, userController.get_pending_follower_request_count)

//  ------   Notification Routes   ------
router.post('/notification/get', userJWT, userController?.get_notification)
router.post('/notification/delete', userJWT, userController?.delete_notification)
router.get('/notification', userJWT, userController?.read_notification)
router.get('/notification/count', userJWT, userController?.count_notification)

//  ------   Video Routes   ------
router.post('/video', userJWT, validation.add_update_video, userController.add_video)
router.put('/video', userJWT, validation.add_update_video, userController.update_video)
router.post('/video/trend/get', userJWT, userBlock, userController.get_video_by_trending_pagination)
router.delete('/video/:id', userJWT, validation?.by_id, userController.delete_video)
router.get('/video/like/:id', userJWT, validation?.by_id, userController.like_video)
router.get('/video/dislike/:id', userJWT, validation?.by_id, userController.dislike_video)
router.post('/video/get', partialJWT, userBlock, userController.get_video_pagination)
router.post('/video/get_by_tag', userJWT, userBlock, userController.get_video_by_tag_pagination)
router.post('/video/get_by_tag_name', userJWT, userBlock, userController.get_video_by_tag_name_pagination)
router.post('/video/get_by_user', userJWT, userController.get_video_by_user_pagination)
router.post('/video/get_by_user1', userJWT, userController.get_video_by_user_pagination1)
router.get('/video/:id', userJWT, validation?.by_id, userController.by_id_video)
router.get('/video/share/:id', userJWT, validation?.by_id, userController.share_video_link)
router.get('/video/view/:id', partialJWT, validation?.by_id, userController.add_count_view_video)


// ------ Job Routes --------
router.post('/job', userJWT, validation?.add_update_job, userController?.add_job)
router.put('/job', userJWT, validation?.add_update_job, userController?.update_job)
router.post('/job/get', userJWT, userController?.get_job_pagination)
router.get('/job/complete/:id', userJWT, userController?.complete_job)
router.get('/job/start/:id', userJWT, userController?.start_job)
router.delete('/job/:id', userJWT, userController?.delete_job)

// -----Block List ------
router.get('/block/request/:id', userJWT, validation?.by_id, userController.block_request)
router.post('/block', userJWT, userController.get_block_pagination)


// -----Enquiry Routes -----
router.post('/enquiry', userJWT, validation?.add_update_enquiry, userController?.add_enquiry)
router.post('/enquiry/get', userJWT, userController?.get_enquiry_pagination)
router.put('/enquiry', userJWT, validation?.add_update_enquiry, userController?.update_enquiry)
router.delete('/enquiry/:id', userJWT, userController?.delete_enquiry)
















export const userRouter = router