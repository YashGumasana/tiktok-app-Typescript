// export const apiResponse = async (status: any, message: any, data: any, error: any) => {
//     return {
//         status,
//         message,
//         data: await (data),
//         error: Object.keys(error)?.length == 0 ? {} : await (error)
//     }
// }

export const userStatus = {
    user: 0,
    admin: 1,
    upload: 5,
}

export class apiResponse {
    private status: number | null
    private message: string | null
    private data: any | null
    private error: any | null
    constructor(status: number, message: string, data: any, error: any) {
        this.status = status
        this.message = message
        this.data = data
        this.error = error
    }
}

export const loginType = {
    custom: 0,
    google: 1,
    facebook: 2,
    apple: 3
}

export const URL_decode = (url: any) => {
    let folder_name = [], image_name: any

    // console.log(url, 'url');
    url.split('/').map((value: any, index: any, arr: any) => {
        image_name = url.split('/')[url.split('/').length - 1],
            // console.log(url.split('/'));
            // console.log(url.split('/').length);
            // console.log(image_name, 'image_name');

            folder_name = (url.split('/'))
        // console.log(folder_name, 'folder_name');

        folder_name.splice(url.split('/').length - 1, 1)
        // console.log(folder_name, 'folder_name222');

    })
    // console.log(folder_name.join('/'), image_name, '*-**');
    return [folder_name.join('/'), image_name]
}

export const type = {
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
}

export const notification_template = {
    like: async (data: any) => {
        return {
            template: {
                title: `Zois`,
                body: `${data.username || ""} has like your video`
            },
            data: {
                type: 0,
                videoId: data?.videoId,
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        }
    },

    dislike: async (data: any) => {
        return {
            template: {
                title: `Zois`,
                body: `${data.username || ""} has dislike your video.`
            },
            data: {
                type: 1,
                videoId: data?.videoId,
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        }
    },

    accept_request: async (data: any) => {
        return {
            template: {
                title: `Zois`, body: `${data.username || ""} has accepted your request.`
            },
            action: {
                body: `${data.username || ""} has started following you.`
            },
            data: {
                type: 2, followerId: data?._id, createdBy: data?.createdBy, click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        }
    },
    reject_request: async (data: any) => {
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
                followerId: data?._id,
                createdBy: data?.createdBy, click_action: "FLUTTRT_NOTIFICATION_CLICK"
            }
        }
    },
    follow_request: async (data: any) => {
        // console.log('common follow_request');
        // console.log(data);
        return {
            template: {
                title: `Zois`,
                body: `${data.username || ""} has requested you to follow`
            },
            data: {
                type: 4,
                followerId: data?.followerId,
                createdBy: data?._id,
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        }
    },
    comment: async (data: any) => {
        return {
            template: {
                title: `Zois`,
                body: `${data.username || ""}has commented your ${data?.type == type?.notification?.video_comment ? 'video' : 'feed'}.`
            },
            data: {
                type: data?.type,
                videoId: data?.videoId,
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            }
        }
    },
    message: async (data: any) => {
        return {
            template: {
                title: `Zois`, body: `${data.username || ""} has messaged you.`
            },
            data: {
                type: 7, message: data?.message, click_action: "chat listing",
            }
        }
    },
}

export const getArea = (current: { lat: any, long: any }, RadiusInKm: number) => {
    const differenceForLat = RadiusInKm / 111.12
    const curve = Math.abs(Math.cos((2 * Math.PI * parseFloat(current.lat)) / 360.0))
    const differenceForLong = RadiusInKm / (curve * 111.12)
    const minLat = parseFloat(current.lat) - differenceForLat
    const maxLat = parseFloat(current.lat) + differenceForLat
    const minlon = parseFloat(current.long) - differenceForLong
    const maxlon = parseFloat(current.long) + differenceForLong

    return {
        min: {
            lat: minLat,
            long: minlon,
        },
        max: {
            lat: maxLat,
            long: maxlon,
        }
    }
}

export const not_first_one = (a1: Array<any>, a2: Array<any>) => {
    // console.log(a1, '+', a2);
    let a = [], diff = []
    // console.log(a1.length);
    for (let i = 0; i < a1.length; i++) {
        // console.log(a1[i], '-*-*');
        a[a1[i]] = true
    }
    // console.log(a, 'a1');
    for (let i = 0; i < a2.length; i++) {
        if (a[a2[i]]) {
            delete a[a2[i]]
        }
    }
    // console.log(a, 'a2');
    for (let k in a) {
        diff.push(k)
    }
    // console.log(diff, 'diff');
    return diff
}

export const [cachingTimeOut, commentLimit, RadiusInKm] = [1800, 2, 100]