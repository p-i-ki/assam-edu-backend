module.exports = (theFunc) => (req, res, next) => {
  Promise.resolve(theFunc(req, res, next)).catch(next);
};
// it is like try-catch bloc .. if error occured it will handle and execute the error..
