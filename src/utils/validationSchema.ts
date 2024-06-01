import * as yup from 'yup';
import { isValidObjectId } from 'mongoose';

export const CreateUserSchema = yup.object().shape({
  name: yup.string().trim().required('name is missing').min(3, 'name is too short')
    .max(20, 'name is too long'),
  email: yup.string().required('email is missing').email('invalid email'),
  password: yup.string().trim().required('password is missing').min(8, 'password is too short')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,'password is too simple')
});

// verify is token valid and userId is correct type
export const TokenAndIDValidation = yup.object().shape({
  token: yup.string().trim().required('Invalid token'),
  userId: yup.string().transform(function(value) {
    if (this.isType(value) && isValidObjectId(value)) {
      return value;
    } 
    return ""
  }).required("invalid user id"),
});

export const UpdatePasswordSchema = yup.object().shape({
  token: yup.string().trim().required('Invalid token'),
  userId: yup.string().transform(function(value) {
    if (this.isType(value) && isValidObjectId(value)) {
      return value;
    } 
    return ""
  }).required("invalid user id"),
  password: yup.string().trim().required('password is missing').min(8, 'password is too short')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#\$%\^&\*])[a-zA-Z\d!@#\$%\^&\*]+$/,'password is too simple')
});