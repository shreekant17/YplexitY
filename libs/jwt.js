import jwt from "jsonwebtoken";

//const secret = 'StateBankOfIndia';
const secret = process.env.JWT_SECRET_KEY; // Replace with a strong, secret key

export const generateToken = (payload) => {
  return jwt.sign(payload, secret, { expiresIn: "5d" }); // Adjust the expiration time as needed
};

export const verifyToken = (token) => {
  const jwtToken = token.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(jwtToken, secret);

    return decoded;
  } catch (error) {
    // Token verification failed
    console.log(error);
    return null;
  }
};
