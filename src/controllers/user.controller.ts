import { RequestHandler } from "express";
import { CreateUser, VerifyEmailRequest } from "#/@types/user";
import { User } from "#/models/user";
import { generateToken } from "#/utils/helper";
import { sendForgetPasswordLink, sendPassResetSuccessEmail, sendVerificationMail } from "#/utils/mail";
import EmailVerificationToken from '#/models/emailVerificationToken';
import { isValidObjectId } from "mongoose";
import crypto from 'crypto';
import passwordResetToken from "#/models/passwordResetToken";
import { PASSWORD_RESET_LINK } from "#/utils/variables";

export const create: RequestHandler = async (req: CreateUser, res) => {

  const { email, password, name } = req.body;
  const user = await User.create({ name, email, password });

  const token = generateToken();

  await EmailVerificationToken.create({
    owner: user._id,
    token,
  });

  // send mail
  sendVerificationMail(token, { name, email, userId: user._id.toString()});
  res.status(201).json({user: {id: user._id, name, email}});

}

export const verifyEmail: RequestHandler = async (req: VerifyEmailRequest, res) => {

  // GET TOKEN AND USER ID
  const { token, userId } = req.body;

  // GET TOKEN BY USER ID
  const verificationToken = await EmailVerificationToken.findOne({
    owner: userId,
  });

  // VERIFY IF TOKEN IS VALID
  if (!verificationToken) return res.status(403).json({ error: 'invalid token' });

  // COMPARE TOKENS IS IQUAL
  const matched = await verificationToken.compareToken(token);
  if (!matched) return res.status(403).json({ error: 'invalid token' });

  // UPDATE VERIFICATION
  await User.findByIdAndUpdate(userId, { verified: true });
  // DELETE TOKEN VERIFIELD
  await EmailVerificationToken.findByIdAndDelete(verificationToken._id);

  res.json({ message: 'Your email is verified' });

}

export const sendReVerificationToken: RequestHandler = async (req, res) => {

  // GET TOKEN AND USER ID
  const { userId } = req.body;

  if (!isValidObjectId(userId)) return res.status(403).json({ error: 'Invalid request' });

  // VERIFY IF USER EXIST
  const user = await User.findById(userId);
  if (!user) return res.status(403).json({ error: 'Invalid request' });

  // REMOVE PREVIOUS TOKEN
  await EmailVerificationToken.findOneAndDelete({
    owner: userId
  });

  // GENERATE A NEW TOKEN
  const token = generateToken();

  await EmailVerificationToken.create({
    owner: userId,
    token,
  });

  // SEND A VERIFICATION EMAIL
  sendVerificationMail(token, {
    name: user?.name,
    email: user?.email,
    userId: user?._id.toString()
  });

  res.status(200).json({ message: 'Please check your email' });

}

export const generateForgetPasswordLink: RequestHandler = async (req, res) => {

  const { email } = req.body;

  const user = await User.findOne({email});
  if (!user) return res.status(404).json({ error: 'Account not found' });

  await passwordResetToken.findOneAndDelete({
    owner: user._id,
  });

  // GENERATE LINK
  const token = crypto.randomBytes(36).toString('hex');

  await passwordResetToken.create({
    owner: user._id,
    token,
  });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  sendForgetPasswordLink({email: user.email, link: resetLink });

  res.json({ message: 'Check your registered mail' });

}

export const isValidPassResetToken: RequestHandler = async (req, res) => {

  const { token, userId } = req.body;

  const resetToken = await passwordResetToken.findOne({owner: userId});
  if (!resetToken) return res.status(403).json({ error: "unauthorized access, invalid token!"});

  const matched = await resetToken.compareToken(token);
  if (!matched) return res.status(403).json({ error: "unauthorized access, invalid token!"});

  res.json({ message: 'your token is valid.'});

}

export const grantValid: RequestHandler = async (req, res) => {
  res.json({ valid: true });
}

export const updatePassword: RequestHandler = async (req, res) => {
  
  const { password, userId } = req.body;

  const user  = await User.findById(userId);
  if (!user) return res.status(403).json({ error: 'unauthorized access!' });

  const matched = await user.comparePassword(password);
  if (matched) return res.status(422).json({ error: 'the new password must be different'});

  user.password = password;
  await user.save();

  await passwordResetToken.findOneAndDelete({ owner: user._id });

  sendPassResetSuccessEmail(user.name, user.email);

  res.json({ message: 'Password resets successfully' });

}
