import { Toast } from "./src/services/useToast";
import { AuthInstanceApi } from "./src/services/axios";
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const data = {
    email: email,
    password: password
  }

  try {
    const response = await AuthInstanceApi.post('/user/login', data);
    console.log(response);
    if (response.status === 200) {
      localStorage.setItem('userData',JSON.stringify(response.data));
      Toast.fire({
        icon: 'success',
        title: 'Usuario autenticado correctamente'
      }).then(() => {
        window.location.href = 'http://localhost:5173/src/pages/core/home/home.html';
      });  
    } 
    
  } catch (error) {
    console.error(error);
    Toast.fire({
      icon: 'error',
      title: 'Error al autenticar el usuario'
    });
  }
}

document.getElementById('loginForm').addEventListener('submit', handleLogin);