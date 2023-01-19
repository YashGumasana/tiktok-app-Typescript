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
exports.deleteImage = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const config_1 = __importDefault(require("config"));
const winston_logger_1 = require("./winston_logger");
const ffmpeg_1 = require("@ffmpeg-installer/ffmpeg");
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
fluent_ffmpeg_1.default.setFfmpegPath(ffmpeg_1.path);
const aws = config_1.default.get('aws');
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: aws.accessKeyId,
    secretAccessKey: aws.secretAccessKey,
    region: aws.region
});
const bucket_name = aws.bucket_name;
const deleteImage = function (file, folder) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(function (resolve, reject) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const bucketPath = `${bucket_name}/${folder}`;
                    let params = {
                        Bucket: bucketPath,
                        Key: file
                    };
                    yield s3.deleteObject(params, function (err, data) {
                        if (err) {
                            console.log(err);
                            reject(err);
                        }
                        else {
                            winston_logger_1.logger.info("File successfully delete");
                            resolve("File successfully delete");
                        }
                    });
                }
                catch (error) {
                    console.log(error);
                    reject();
                }
            });
        });
    });
};
exports.deleteImage = deleteImage;
//# sourceMappingURL=S3.js.map