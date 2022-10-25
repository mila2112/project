export const UserValidator = {
  schema: {
    id: [{ type: "string" }, { type: "email" }],
    password: { type: "string", min: 8, max: 15 },
  },
};
