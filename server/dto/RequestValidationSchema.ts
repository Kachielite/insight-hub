import Joi from 'joi';

export class AuthenticationValidationSchema {
  public static loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  public static registrationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).required(),
  });

  public static passwordResetSchema = Joi.object({
    newPassword: Joi.string().min(6).required(),
    resetToken: Joi.string().required(),
  });
}

export class ProjectValidationSchema {
  public static projectSchema = Joi.object({
    projectName: Joi.string().min(2).required(),
  });

  public static inviteSchema = Joi.object({
    memberEmail: Joi.string().email().required(),
    role: Joi.string().valid('ADMIN', 'MEMBER').optional(),
  });
}
