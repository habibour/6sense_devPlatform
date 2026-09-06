// The one place the success envelope shape is written, so every controller produces
// an identical { success, data, message } response instead of hand-rolling it.
function sendSuccess(res, data, message, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });
}

module.exports = { sendSuccess };
