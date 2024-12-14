import { Toast } from "../../services/useToast";
import { validateEmail, validatePassword } from "../../services/validates";
import { AuthInstanceApi } from "../../services/axios";

async function handleRegister (event) {
  event.preventDefault();
  const name = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const data = {
    name: name,
    email: email,
    password: password,
    confirmPassword: confirmPassword,
  }
  console.log(data);

  if (data.name <= 6) {
    Toast.fire({
      icon: "error",
      title: "El nombre de usuario debe tener al menos 6 caracteres",
    });
    return;
  }
  if (data.username == '' || data.email == '' || data.password == '' || data.passwordConfirm == '') {
    Toast.fire({
      icon: "error",
      title: "Todos los campos son requeridos",
    });
    return;
  }

  if (data.password != data.confirmPassword) {
    Toast.fire({
      icon: "error",
      title: "Las contraseñas no coinciden",
    });
    return;
  }
  if (!validateEmail(data.email)) {
    Toast.fire({
      icon: "error",
      title: "Dirección de correo electrónico inválida",
    });
    return;
  }
  if (!validatePassword(data.password)) {
    Toast.fire({
      icon: "error",
      title: "Contraseña invalida, debe contener al menos una letra mayúscula, una letra minúscula y un número", 
    });
    return;
  }
  try {
    const response = await AuthInstanceApi.post("/user/create",data);
    console.log(response);
    Toast.fire({
      icon: "success",
      title: "Usuario registrado correctamente",
    });
    window.location.href = "../../../index.html";
  } catch (error) {
    console.error(error);
    Toast.fire({
      icon: "error",
      title: "Error al registrar el usuario",
    });
  }
}

document.getElementById("registerForm").addEventListener("submit", handleRegister);