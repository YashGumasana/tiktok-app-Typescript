export const responseMessage: any = {
    alreadyUsername: "You have entered username is already exist!",
    accountBlock: "Your account has been blocked",
    alreadyEmail: "Entering the existing email address",
    internalServerError: "Internal Server Error!",
    invalidUserPasswordEmail: "You have entered an invalid email or password!",
    loginSuccess: "Login Successful!",
    invalidOTP: "Invalid OTP!",
    OTPverified: "OTP has been verified successfully!",
    invalidEmail: "You have entered an invalid email!",
    errorMail: "Error in mail system!",
    resetPasswordSuccess: "Your password has been successfully reset!",
    resetPasswordError: "Error in reset password!",
    invalidIdTokenAndAccessToken: "You have entered an invalid idToken or accessToken!",
    accessDenied: "Access Denied!",
    invalidToken: "Invalid Token!",
    differentToken: "Do not try a different token!",
    tokenNotFound: "We can't find tokens in header!",
    expireOTP: "OTP has been expired!",
    invalidOldPassword: "You have entered an invalid old password!",
    passwordChangeSuccess: "Password has been changed!",
    logout: "Logout Successful!",
    blockbyuser: "this user's id is block by you otherwise you block by this user ",
    signupSuccess: "Registration Successful!",
    allNotificationDelete: "All notification has been deleted",
    selectedNotificationDelete: "Selected notification has been deleted",
    addDataError: "Oops! Something went wrong!",





    invalidId: (message: string): any => {
        return `Invalid ${message}!`
    },

    customMessage: (message: string): any => {
        return `${message}!`
    },

    updateDataSuccess: (message: string): any => {
        return `${message[0].toUpperCase() + message.slice(1).toLowerCase()} has been successfully updated!`
    },

    updateDataError: (message: string): any => {
        return `${message[0].toUpperCase() + message.slice(1).toLowerCase()} updating time getting an error!`
    },

    getDataNotFound: (message: String): any => {
        return `we could not find the ${message.toLowerCase()} you requested`
    },

    getDataSuccess: (message: string): any => {
        return `${message[0].toUpperCase() + message.slice(1).toLowerCase()} successfully retrieved!`
    },

    deleteDataSuccess: (message: string): any => {
        return `Your ${message.toLowerCase()} has been successfully deleted!`
    },

    addDataSuccess: (message: string): any => {
        return `${message[0].toUpperCase() + message.slice(1).toLowerCase()} successfully added!`
    }

}