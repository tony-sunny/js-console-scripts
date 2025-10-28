const getFormData = () => {
  const forms = Array.from(document.querySelectorAll("form"))
  if (forms.length === 0) {
    console.log("No forms found")
  }
  forms.forEach(form => {
    const elements =Array.from(form.elements)
    console.log(`Fields for ${form.id}`)
    elements.forEach(el => console.log(el.name, el.value))
  })
}

getFormData()
