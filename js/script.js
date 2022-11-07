//BLUR
const button = document.querySelectorAll('.btn-minecraft')
button.forEach(btn => {
  btn.addEventListener('mouseleave', function () {
    btn.blur()
  })
})
//MOSTRAR MI IMAGEN 
function showPicture() {
  document.getElementById('image').style.display = 'block';
}