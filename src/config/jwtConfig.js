module.exports = {
  secret:
    process.env.JWT_SECRET ||
    "58989608e010cddb1cffd2a426ad08aa09f8023c66b7e9398f03df551348f485",
  expiresIn: "1d",
};
