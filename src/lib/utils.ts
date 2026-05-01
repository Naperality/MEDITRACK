export const getPHDate = () => {
  // Returns a date object shifted to Philippine Time
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
};