"use strict";
// export const apiResponse = async (status: any, message: any, data: any, error: any) => {
//     return {
//         status,
//         message,
//         data: await (data),
//         error: Object.keys(error)?.length == 0 ? {} : await (error)
//     }
// }
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadiusInKm = exports.commentLimit = exports.cachingTimeOut = exports.not_first_one = exports.getArea = exports.notification_template = exports.type = exports.URL_decode = exports.loginType = exports.apiResponse = exports.userStatus = void 0;
exports.userStatus = {
    user: 0,
    admin: 1,
    upload: 5,
};
class apiResponse {
    constructor(status, message, data, error) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.error = error;
    }
}
exports.apiResponse = apiResponse;
exports.loginType = {
    custom: 0,
    google: 1,
    facebook: 2,
    apple: 3
};
const URL_decode = (url) => {
    let folder_name = [], image_name;
    // console.log(url, 'url');
    url.split('/').map((value, index, arr) => {
        image_name = url.split('/')[url.split('/').length - 1],
            // console.log(url.split('/'));
            // console.log(url.split('/').length);
            // console.log(image_name, 'image_name');
            folder_name = (url.split('/'));
        // console.log(folder_name, 'folder_name');
        folder_name.splice(url.split('/').length - 1, 1);
        // console.log(folder_name, 'folder_name222');
    });
    // console.log(folder_name.join('/'), image_name, '*-**');
    return [folder_name.join('/'), image_name];
};
exports.URL_decode = URL_decode;
exports.type = {
    notification: {
        like: 0, dislike: 1, accept_request: 2, reject_request: 3, follow_request: 4, video_comment: 5, feed_comment: 6, read: 0, unread: 1,
    },
    follower: {
        pending: 0, accept: 1, reject: 2,
    },
    like: {
        video: 0, feed: 1
    },
    comment: {
        video: 0, feed: 1
    },
    proposal: {
        pending: 0, accept: 1, reject: 2
    },
    job: {
        pending: 0, running: 1, complete: 2
    }
};
exports.notification_template = {
    like: (data) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            template: {
                title: `Zois`,
                body: `${data.username || ""} has like your video`
            },
            data: {
                type: 0,
                videoId: data === null || data === void 0 ? void 0 : data.videoId,
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        };
    }),
    dislike: (data) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            template: {
                title: `Zois`,
                body: `${data.username || ""} has dislike your video.`
            },
            data: {
                type: 1,
                videoId: data === null || data === void 0 ? void 0 : data.videoId,
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        };
    }),
    accept_request: (data) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            template: {
                title: `Zois`, body: `${data.username || ""} has accepted your request.`
            },
            action: {
                body: `${data.username || ""} has started following you.`
            },
            data: {
                type: 2, followerId: data === null || data === void 0 ? void 0 : data._id, createdBy: data === null || data === void 0 ? void 0 : data.createdBy, click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        };
    }),
    reject_request: (data) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            template: {
                title: `Zois`,
                body: `${data.username || ""} has rejected your request.`
            },
            action: {
                body: `${data.username || ""} has declined following request.`
            },
            data: {
                type: 3,
                followerId: data === null || data === void 0 ? void 0 : data._id,
                createdBy: data === null || data === void 0 ? void 0 : data.createdBy, click_action: "FLUTTRT_NOTIFICATION_CLICK"
            }
        };
    }),
    follow_request: (data) => __awaiter(void 0, void 0, void 0, function* () {
        // console.log('common follow_request');
        // console.log(data);
        return {
            template: {
                title: `Zois`,
                body: `${data.username || ""} has requested you to follow`
            },
            data: {
                type: 4,
                followerId: data === null || data === void 0 ? void 0 : data.followerId,
                createdBy: data === null || data === void 0 ? void 0 : data._id,
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        };
    }),
    comment: (data) => __awaiter(void 0, void 0, void 0, function* () {
        var _b;
        return {
            template: {
                title: `Zois`,
                body: `${data.username || ""}has commented your ${(data === null || data === void 0 ? void 0 : data.type) == ((_b = exports.type === null || exports.type === void 0 ? void 0 : exports.type.notification) === null || _b === void 0 ? void 0 : _b.video_comment) ? 'video' : 'feed'}.`
            },
            data: {
                type: data === null || data === void 0 ? void 0 : data.type,
                videoId: data === null || data === void 0 ? void 0 : data.videoId,
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        };
    }),
    message: (data) => __awaiter(void 0, void 0, void 0, function* () {
        return {
            template: {
                title: `Zois`, body: `${data.username || ""} has messaged you.`
            },
            data: {
                type: 7, message: data === null || data === void 0 ? void 0 : data.message, click_action: "chat listing",
            }
        };
    }),
};
const getArea = (current, RadiusInKm) => {
    const differenceForLat = RadiusInKm / 111.12;
    const curve = Math.abs(Math.cos((2 * Math.PI * parseFloat(current.lat)) / 360.0));
    const differenceForLong = RadiusInKm / (curve * 111.12);
    const minLat = parseFloat(current.lat) - differenceForLat;
    const maxLat = parseFloat(current.lat) + differenceForLat;
    const minlon = parseFloat(current.long) - differenceForLong;
    const maxlon = parseFloat(current.long) + differenceForLong;
    return {
        min: {
            lat: minLat,
            long: minlon,
        },
        max: {
            lat: maxLat,
            long: maxlon,
        }
    };
};
exports.getArea = getArea;
const not_first_one = (a1, a2) => {
    // console.log(a1, '+', a2);
    let a = [], diff = [];
    // console.log(a1.length);
    for (let i = 0; i < a1.length; i++) {
        // console.log(a1[i], '-*-*');
        a[a1[i]] = true;
    }
    // console.log(a, 'a1');
    for (let i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]];
        }
    }
    // console.log(a, 'a2');
    for (let k in a) {
        diff.push(k);
    }
    // console.log(diff, 'diff');
    return diff;
};
exports.not_first_one = not_first_one;
_a = [1800, 2, 100], exports.cachingTimeOut = _a[0], exports.commentLimit = _a[1], exports.RadiusInKm = _a[2];
//# sourceMappingURL=index.js.map