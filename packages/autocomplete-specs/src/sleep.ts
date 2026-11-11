const spec: Fig.Spec = {
  name: "sleep",
  description: "Suspend execution for an interval",
  args: {
    name: "number[unit]",
    description: "Duration, with optional s, m, h, or d suffix",
    isVariadic: true,
  },
};

export default spec;
