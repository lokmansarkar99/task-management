
// import { ErrorRequestHandler } from "express"
// import { ZodError } from "zod"
// import { Error as MongooseError } from "mongoose"
// import config from "../../config"
// import ApiError from "../../errors/ApiErrors"
// import handleValidationError from "../../errors/handleValidationError"
// import handleZodError from "../../errors/handleZodError"
// import { errorLogger } from "../../shared/logger"
// import { IErrorMessage } from "../../types/errors.type"
// import { StatusCodes } from "http-status-codes"
// import { RESPONSE_MODE } from "../../constants/responseMode"
// import { responseMode } from "../../config/responseMode"

// const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
//   config.node_env === "development"
//     ? console.log(" globalErrorHandler", error)
//     : errorLogger.error(" globalErrorHandler", error)

//   let statusCode = 500
//   let message = "Something went wrong"
//   let errorMessages: IErrorMessage[] = []

//   if (error.name === "ZodError") {
//     const simplified = handleZodError(error)
//     statusCode = simplified.statusCode
//     message = simplified.message
//     errorMessages = simplified.errorMessages

//   } else if (error.name === "ValidationError") {
//     const simplified = handleValidationError(error)
//     statusCode = simplified.statusCode
//     message = simplified.message
//     errorMessages = simplified.errorMessages

//   } else if (error.name === "TokenExpiredError") {
//     statusCode = StatusCodes.UNAUTHORIZED
//     message = "Session Expired"
//     errorMessages = [{ path: "", message: "Your session has expired. Please log in again." }]

//   } else if (error.name === "JsonWebTokenError") {
//     statusCode = StatusCodes.UNAUTHORIZED
//     message = "Invalid Token"
//     errorMessages = [{ path: "", message: "Your token is invalid. Please log in again." }]

//   } else if (error.name === "CastError") {
//     statusCode = StatusCodes.BAD_REQUEST
//     message = "Invalid ID"
//     errorMessages = [{ path: "", message: `Invalid ObjectId: ${error.value}` }]

//   } else if (error.code === 11000) {
//     // MongoDB duplicate key
//     const field = Object.keys(error.keyValue)[0]
//     statusCode = StatusCodes.CONFLICT
//     message = `${field} already exists`
//     errorMessages = [{ path: field, message: `${field} already exists` }]

//   } else if (error instanceof ApiError) {
//     statusCode = error.statusCode
//     message = error.message
//     errorMessages = error.message ? [{ path: "", message: error.message }] : []

//   } else if (error instanceof Error) {
//     message = error.message
//     errorMessages = error.message ? [{ path: "", message: error.message }] : []
//   }

//   // SOFT vs STRICT mode
//   if (responseMode === RESPONSE_MODE.SOFT) {
//     return res.status(200).json({
//       success: false,
//       message,
//       errorMessages,
//       data: [],
//       stack: config.node_env !== "production" ? error?.stack : undefined,
//     })
//   }

//   return res.status(statusCode).json({
//     success: false,
//     message,
//     errorMessages,
//     stack: config.node_env !== "production" ? error?.stack : undefined,
//   })
// }

// export default globalErrorHandler




// =====================UPDATED ERROR HANDLER FOR  EVERY REQUEST LOGG ==============
import { ErrorRequestHandler } from "express"
import { ZodError } from "zod"
import { Error as MongooseError } from "mongoose"
import config from "../../config"
import ApiError from "../../errors/ApiErrors"
import handleValidationError from "../../errors/handleValidationError"
import handleZodError from "../../errors/handleZodError"
import { errorLogger } from "../../shared/logger"
import { IErrorMessage } from "../../types/errors.type"
import { StatusCodes } from "http-status-codes"
import { RESPONSE_MODE } from "../../constants/responseMode"
import { responseMode } from "../../config/responseMode"

// Remove  Sensitive fields AND LOG 
const sanitizeBody = (body: unknown) => {
  if (!body || typeof body !== "object") return body
  const clone: Record<string, unknown> = { ...(body as Record<string, unknown>) }
  const sensitiveKeys = ["password", "oldPassword", "newPassword", "confirmPassword", "token"]
  sensitiveKeys.forEach((key) => {
    if (clone[key]) clone[key] = "***REDACTED***"
  })
  return clone
}

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  let statusCode = 500
  let message = "Something went wrong"
  let errorMessages: IErrorMessage[] = []

  if (error.name === "ZodError") {
    const simplified = handleZodError(error)
    statusCode = simplified.statusCode
    message = simplified.message
    errorMessages = simplified.errorMessages

  } else if (error.name === "ValidationError") {
    const simplified = handleValidationError(error)
    statusCode = simplified.statusCode
    message = simplified.message
    errorMessages = simplified.errorMessages

  } else if (error.name === "TokenExpiredError") {
    statusCode = StatusCodes.UNAUTHORIZED
    message = "Session Expired"
    errorMessages = [{ path: "", message: "Your session has expired. Please log in again." }]

  } else if (error.name === "JsonWebTokenError") {
    statusCode = StatusCodes.UNAUTHORIZED
    message = "Invalid Token"
    errorMessages = [{ path: "", message: "Your token is invalid. Please log in again." }]

  } else if (error.name === "CastError") {
    statusCode = StatusCodes.BAD_REQUEST
    message = "Invalid ID"
    errorMessages = [{ path: "", message: `Invalid ObjectId: ${error.value}` }]

  } else if (error.code === 11000) {
    // MongoDB duplicate key
    const field = Object.keys(error.keyValue)[0]
    statusCode = StatusCodes.CONFLICT
    message = `${field} already exists`
    errorMessages = [{ path: field, message: `${field} already exists` }]

  } else if (error instanceof ApiError) {
    statusCode = error.statusCode
    message = error.message
    errorMessages = error.message ? [{ path: "", message: error.message }] : []

  } else if (error instanceof Error) {
    message = error.message
    errorMessages = error.message ? [{ path: "", message: error.message }] : []
  }

  // Full-Context Structured Logging (Request + Error )
  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    message,
    user: req.user
      ? { id: req.user.id, email: req.user.email, role: req.user.role }
      : "unauthenticated",
    requestBody: sanitizeBody(req.body),
    requestParams: req.params,
    requestQuery: req.query,
    errorName: error.name,
    stack: error.stack,
  }

  config.node_env === "development"
    ? console.log("🔴 globalErrorHandler:", JSON.stringify(logPayload, null, 2))
    : errorLogger.error(JSON.stringify(logPayload))

  // SOFT vs STRICT mode
  if (responseMode === RESPONSE_MODE.SOFT) {
    return res.status(200).json({
      success: false,
      message,
      errorMessages,
      data: [],
      stack: config.node_env !== "production" ? error?.stack : undefined,
    })
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errorMessages,
    stack: config.node_env !== "production" ? error?.stack : undefined,
  })
}

export default globalErrorHandler
