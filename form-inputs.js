const getFormData = () => {
  const SKIP_TYPES = new Set(["submit", "button", "reset", "image"]);

  // Bypass named-input shadowing (e.g. <input name="elements">)
  const getElements = Object.getOwnPropertyDescriptor(
    HTMLFormElement.prototype,
    "elements",
  ).get;

  const isField = (el) =>
    el.matches("input, select, textarea") && !SKIP_TYPES.has(el.type);

  const fieldValue = (el) => {
    if (el.tagName === "SELECT" && el.multiple) {
      return [...el.selectedOptions].map((o) => o.value);
    }
    switch (el.type) {
      case "file":
        return [...el.files].map((f) => f.name);
      case "password":
        return el.value ? "•".repeat(el.value.length) : "";
      default:
        return el.value;
    }
  };

  const describe = (el) => ({
    name: el.getAttribute("name") || el.id || "(unnamed)",
    type: el.type,
    value: fieldValue(el),
    ...(el.type === "checkbox" || el.type === "radio"
      ? { checked: el.checked }
      : {}),
    disabled: el.disabled,
  });

  const result = {};

  document.querySelectorAll("form").forEach((form, i) => {
    const label =
      form.getAttribute("id") ||
      form.getAttribute("name") ||
      form.getAttribute("action") ||
      `form #${i + 1}`;
    result[label] = [...getElements.call(form)].filter(isField).map(describe);
  });

  // Fields not associated with any form (common in React apps)
  const orphans = [...document.querySelectorAll("input, select, textarea")]
    .filter((el) => !el.form && isField(el))
    .map(describe);
  if (orphans.length) result["(no form)"] = orphans;

  if (Object.keys(result).length === 0) {
    console.log("No form fields found");
    return;
  }

  for (const [label, rows] of Object.entries(result)) {
    console.group(label);
    console.table(rows);
    console.groupEnd();
  }
  return result;
};

getFormData();
