import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map((d) => d.message),
      });
      return;
    }
    
    next();
  };
};

// Common validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const movieSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  genre: Joi.array().items(Joi.string()).min(1).required(),
  releaseYear: Joi.number().integer().min(1900).max(new Date().getFullYear() + 5).required(),
  duration: Joi.number().integer().min(1).required(),
  cast: Joi.array().items(Joi.string()),
  director: Joi.string(),
  language: Joi.string(),
});

export const reviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  text: Joi.string().max(2000),
});
