import { crypto } from "@third-party";
import { ValidationError } from "packages/error-handler";
import redis from "packages/libs/redis";
import { sendEmail } from "./sendMail";
import { NextFunction } from "express";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
    data: any,
    userType: "user" | "seller") => {
    
        const { name, email, password, phone_number, country} = data;

        if(!name || !email || !password || (userType === "seller" && (!phone_number || !country))){
            throw new ValidationError("Missing fields required!");
        }
        if(!emailRegex.test(email)){
            throw new ValidationError("Invalid email format!")
        }
}

export const checkOtpRestrictions = async(email: string, next: NextFunction) => {
    if(await redis.get(`otp-lock:${email}`)){
        return next(
            new ValidationError(
                "Account locked due to multiple failed attempts! Try again after 30 mins"
            )
        )
    }
    if(await redis.get(`otp-spam-lock:${email}`)){
        return next(
            new ValidationError(
                "Too many OTP requests! Please wait 1hour before requesting again."
            )
        )
    }
    if(await redis.get(`otp-cooldown:${email}`)){
        return next(
            new ValidationError(
                "Please wait 1min before requesting a new OTP!"
            )
        )
    }

}

export const trackOtpRequests = async(email: string, next: NextFunction) => {
   const otpRequestKey = `otp_request_count${email}`;
    const otpRequests = parseInt((await redis.get(otpRequestKey)) || "0");

    if(otpRequests >= 2) {
        await redis.set(`otp_spam_lock${email}`, "locked", "EX", 3600);
        return next(
            new ValidationError(
                "Too many OTP requests. Please wait 1 hour before requesting again."
            )
        )
    }

    // Track requests for 1hour
    await redis.set(otpRequestKey, otpRequests+1, "EX", 3600); 

}

export const sendOtp = async(name: string, email: string, template: string) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    await sendEmail(email, "Verify Your Email", template, {name, otp});
    await redis.set(`otp:${email}`, otp, "EX", 300);
    await redis.set(`otpcooldown:${email}`, "true", "EX", 60 );
    


}