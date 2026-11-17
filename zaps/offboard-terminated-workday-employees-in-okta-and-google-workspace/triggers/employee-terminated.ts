export default {
  app: "workday",
  event: "employee_terminated",
  connection: "workday",
  params: {
    // Look these up with get_trigger_field_choices for "fields" and the user's Workday connection: the choices for the worker's name, primary work email and termination date.
    fields: [
      "REPLACE_NAME_FIELD_CHOICE",
      "REPLACE_WORK_EMAIL_FIELD_CHOICE",
      "REPLACE_TERMINATION_DATE_FIELD_CHOICE",
    ],
  },
};
