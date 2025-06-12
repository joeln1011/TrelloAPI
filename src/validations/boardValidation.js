import Joi from "joi";
import { StatusCodes } from "http-status-codes";
import e from "express";

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
    //next();
    res.status(StatusCodes.CREATED).json({
      message: "POST: Create Board API",
    });
  } catch (error) {
    console.log(new Error(error));
    res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .json({ errors: new Error(error).message });
  }
};

export const boardValidation = { createNew };
