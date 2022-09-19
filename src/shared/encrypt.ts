import jwt from "jsonwebtoken";

const refreshKey = "01234567890123456789";
const accessKey = "abcdefghijklmnopqrst";

export const sign = (id: number) => {
  const access = jwt.sign({ id }, accessKey, {
    issuer: "younghwan",
    expiresIn: "30m",
  });
  const refresh = jwt.sign({ id }, refreshKey, {
    issuer: "younghwan",
    expiresIn: "15d",
  });
  return {
    access,
    refresh,
  };
};

export const verifyAccess = (access: string) => {
  return jwt.verify(access, accessKey, (err, data) => {
    if (err) return null;
    return data;
  });
};

export const verifyRefresh = (refresh: string) => {
  return jwt.verify(refresh, refreshKey, (err, data) => {
    if (err) return null;
    return data;
  });
};

// export default {}
