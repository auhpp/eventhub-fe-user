import React, { useState } from "react";
import OtpStep from "./OtpStep";
import NewPasswordStep from "./NewPasswordStep";
import EmailStep from "./EmailStep";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");

    const handleEmailSuccess = (userEmail) => {
        setEmail(userEmail);
        setStep(2);
    };

    const handleOtpSuccess = (validOtp) => {
        setOtpCode(validOtp);
        setStep(3);
    };

    return (
        <div className=" flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
            {step === 1 && <EmailStep onSuccess={handleEmailSuccess} />}
            {step === 2 && <OtpStep email={email} onSuccess={handleOtpSuccess} onBack={() => setStep(1)} />}
            {step === 3 && <NewPasswordStep email={email} otpCode={otpCode} />}
        </div>
    );
}