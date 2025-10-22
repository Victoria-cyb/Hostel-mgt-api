import bcrypt from "bcrypt";

export const encrypt = async (value: string) => {
  const salt = await bcrypt.genSalt(10);

  return await bcrypt.hash(value, salt);
};

export const compare = async (newValue: string, existingValue: string) => {
  return await bcrypt.compare(newValue, existingValue);
};
