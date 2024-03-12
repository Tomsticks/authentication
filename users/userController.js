const users = require("../auth/userModel");
const newObj = {};
const filterObj = (obj, ...allowedFileds) => {
  Object.keys(obj).forEach((el) => {
    if (allowedFileds.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

async function getAllUsers(req, res) {
  const user = await users.find();
  if (!user) {
    return res.status(200).json({ message: "no users Found" });
  }

  res.status(200).json({ data: user });
}

async function updateMe(req, res, next) {
  // filter out unwanted fields
  const filterdBody = filterObj(req.body, "name", "email");
  if (req.body.password || req.body.confirmPassword) {
    return res
      .status(404)
      .json({ data: "this route is not for password reset" });
  }

  const updatedUser = await users.findByIdAndUpdate(req.user.id, filterdBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ message: updatedUser });
}

async function deleteMe(req, res, next) {
  await users.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({ message: "success" });
}
module.exports = { getAllUsers, updateMe, deleteMe };
