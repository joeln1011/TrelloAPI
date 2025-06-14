import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import express from "express";
import ApiError from "~/utils/ApiError";

const createNew = async (req, res, next) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      "any.required": "{{#label}} is required",
      "string.min":
        "{{#label}} length must be at least {{#limit}} characters long",
      "string.max":
        "{{#label}} length must be less than or equal to {{#limit}} characters long",
      "string.trim": "{{#label}} must not have leading or trailing whitespace",
      "string.empty": "{{#label}} is not allowed to be empty",
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
  });
  try {
    // using abortEarly: false to return all validation errors
    await correctCondition.validateAsync(req.body, { abortEarly: false });
    // Validation passed, proceed to the next middleware
    next();
  } catch (error) {
    const errorMessage = new Error(error).message;
    const customError = new ApiError(
      StatusCodes.UNPROCESSABLE_ENTITY,
      errorMessage
    );
    next(customError);
  }
};

export const boardValidation = { createNew };
