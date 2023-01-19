import { Request, Response, Router } from 'express'
import { userStatus } from '../common'
import { userRouter } from './user'

const router = Router()
const accessContorl = (req: Request, res: Response, next: any) => {
    // console.log(req.originalUrl.split('/')[1]);
    // console.log(req.originalUrl.split('/'));
    // console.log(req.originalUrl);
    req.headers.userType = userStatus[req.originalUrl.split('/')[1]]
    next()
}

router.use('/user', accessContorl, userRouter)

export { router }