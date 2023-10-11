exports.registerUser = async (req, res) => {
  res.send('User Registered');
};

exports.loginUser = async (req, res) => {
  res.send('User Logged In');
};

exports.logoutUser = async (req, res) => {
  res.send('User Logged Out');
};
