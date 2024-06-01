import nodemailer from 'nodemailer';
import path from 'path';
import { MAILTRAP_PASS, MAILTRAP_USER, SIGN_IN_URL, VERIFICATION_EMAIL } from './variables';
import { generateToken } from './helper';
import EmailVerificationToken from '#/models/emailVerificationToken';
import { generateTemplate } from '#/mail/template';

export interface Profile {
  name: string;
  email: string;
  userId: string;
}

export interface Options {
  email: string;
  link: string;
}

const generateMailTransporter = () => {

  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: MAILTRAP_USER,
      pass: MAILTRAP_PASS,
    }
  });

  return transport;
};

export const sendVerificationMail = async (token: string, profile: Profile) => {

  const transport = generateMailTransporter();
  const {name, email, userId} = profile;

  // const token = generateToken();
  // await EmailVerificationToken.create({
  //   owner: userId,
  //   token,
  // });
  
  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    html: generateTemplate({
      logo: "cid:logo",
      title: "Welcome to Podify",
      message: `Hi ${name}, how are you? This is you verification code.`,
      token: `${token}`
    }),
    attachments: [
      {
        filename: 'logo',
        path: path.join(__dirname, '../mail/images/logo.png'),
        cid: "logo"
      }
    ]
  });
}

export const sendForgetPasswordLink = async (options: Options) => {

  const transport = generateMailTransporter();
  const { email, link } = options;
  
  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: 'Reset password - Podify',
    html: generateTemplate({
      logo: "cid:logo",
      title: "Forgot Password",
      message: `Hi, We just received a request that you forgot your password. No problem you can use the link below and create brancd new password.`,
      token: link
    }),
    attachments: [
      {
        filename: 'logo',
        path: path.join(__dirname, '../mail/images/logo.png'),
        cid: "logo"
      }
    ]
  });
}

export const sendPassResetSuccessEmail = async (name: string, email: string) => {

  const transport = generateMailTransporter();
  
  transport.sendMail({
    to: email,
    from: VERIFICATION_EMAIL,
    subject: 'Password reset with success - Podify',
    html: generateTemplate({
      logo: "cid:logo",
      title: "Password reset with success",
      message: `Hi ${name}, your password was changed with success. You can sign in with your new password.`,
      link: SIGN_IN_URL,
      titleLink: 'sign in now!'
    }),
    attachments: [
      {
        filename: 'logo',
        path: path.join(__dirname, '../mail/images/logo.png'),
        cid: "logo"
      }
    ]
  });
}


