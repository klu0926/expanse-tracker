
const form = document.querySelector('.record-form')

form.addEventListener('submit', event => {
  if (!form.checkValidity()) {
    console.log('表單不通過，不能送出！')
    event.preventDefault()
    event.stopPropagation()
  }

  // for bootstrap validate
  form.classList.add('was-validated')
})