import fs from 'fs'
import multer from 'multer'
import AWS from 'aws-sdk'
import config from 'config'
import { logger, reqInfo } from './winston_logger'
import multerS3 from 'multer-s3'
import { Request, Response } from 'express'
import { apiResponse } from '../common'
import multer_s3_transform from 'multer-s3-transform'
import sharp from 'sharp'
import { responseMessage } from './response'
import { path } from '@ffmpeg-installer/ffmpeg'
import ffmpeg from 'fluent-ffmpeg'
ffmpeg.setFfmpegPath(path)

const aws: any = config.get('aws')
const s3 = new AWS.S3({
    accessKeyId: aws.accessKeyId,
    secretAccessKey: aws.secretAccessKey,
    region: aws.region
})

const bucket_name = aws.bucket_name

// file - image name
// folder - folder name
export const deleteImage = async function (file: any, folder: any) {
    return new Promise(async function (resolve, reject) {
        try {
            const bucketPath = `${bucket_name}/${folder}`

            let params = {
                Bucket: bucketPath,
                Key: file
            }

            await s3.deleteObject(params, function (err, data) {
                if (err) {
                    console.log(err);
                    reject(err)
                }
                else {
                    logger.info("File successfully delete")
                    resolve("File successfully delete")
                }
            })
        }
        catch (error) {
            console.log(error);
            reject()
        }
    })
}