const sendJwtTokenToCookie = (user, statusCode, res) => {
  const token = user.getJwtToken();
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 5 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    user,
  });
};

module.exports = sendJwtTokenToCookie;
