export default {
  app: "bamboohr",
  event: "terminated_employee",
  connection: "bamboohr",
  params: {
    postFields: [
      "firstName",
      "lastName",
      "workEmail",
      "terminationDate",
      "department",
      "jobTitle",
    ],
  },
};
