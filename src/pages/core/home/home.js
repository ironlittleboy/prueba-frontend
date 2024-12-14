import { Toast } from "../../../services/useToast";
import { UserInstanceApi } from "../../../services/axios";
import Swal from "sweetalert2";

let properties = [];
let myReservations = [];

const userData = JSON.parse(localStorage.getItem("userData"));
async function fetchProperties() {
  try {
    const response = await UserInstanceApi.get("/property/getWithLocation");
    console.log(response);
    const properties = response.data; // Ajusta si la estructura es diferente
    return properties;
  } catch (error) {
    console.error(error);
    Toast.fire({
      icon: "error",
      title: "Error al cargar las propiedades",
    });
    return [];
  }
}

async function fetchMyReservations() {
  try {
    const response = await UserInstanceApi.get("/user/getWithReservations/" + userData.id);
    console.log(response);
    const reservations = response.data.reservations; // Ajusta si la estructura es diferente
    return reservations;
  } catch (error) {
    console.error(error);
    Toast.fire({
      icon: "error",
      title: "Error al cargar las reservaciones",
    });
    return [];
  }
}

// calcular total de reservaciones
function calculateTotalReservations(idReservation) {
  const reservation = myReservations.find((reservation) => reservation._id === idReservation);
  const arrivalDate = new Date(reservation.arrivalDate);
  const departureDate = new Date(reservation.departureDate);
  const difference = departureDate.getTime() - arrivalDate.getTime();
  const days = difference / (1000 * 3600 * 24); // dividir los dias de difernte entre milisegundos de un dia
  return days * reservation.property.nightPrice;
}


// filtrar por rango de precio
function filterByPrice() {
  const valueBegin = parseFloat(document.getElementById('price-begin').value);
  const valueEnd = parseFloat(document.getElementById('price-end').value);

  if (isNaN(valueBegin) || isNaN(valueEnd) || valueBegin === 0 || valueEnd === 0) {
    addDataToTable(properties);
    return;
  }

  if (valueBegin > valueEnd) {

    Swal.fire({
      icon: 'error',
      title: 'Rango de precios inválido',
      text: 'El precio inicial no puede ser mayor que el precio final.',
    });
    return;
  }

  const filteredProperties = properties.filter((property) => {
    return property.nightPrice >= valueBegin && property.nightPrice <= valueEnd;
  });

  addDataToTable(filteredProperties);
}


// filtro po tipo de propiedad
function filterByProperty() { 
  const propertyType = document.getElementById("propertyTypeFilter").value;
  if (propertyType === "all") {
    addDataToTable(properties);
    return;
  }

  const filteredProperties = properties.filter((property) => {
    return property.propertyType === propertyType;
  });

  addDataToTable(filteredProperties);

 }


// filtro de ubicación con caracteres similares
function filterByLocation() {
  const location = document.getElementById("locationFilter").value.toLowerCase();
  if (location === "") {
    addDataToTable(properties);
    return;
  }
  const filteredProperties = properties.filter((property) => {

    return property.location.city.toLowerCase().includes(location);
  });

  addDataToTable(filteredProperties);
}

// Hacer que makeReservation esté disponible globalmente
window.makeReservation = function (id) {
  console.log(id);
  Swal.fire({
    title: "Realizar Reservación",
    html: `
    <h3>Horario de estadia</h3>
    <div class="formGroupSwal">
      <label for="name">Nombre de reservacion</label>
      <input type="text" id="name" class="swal2-input" placeholder="Nombre de la reservación">
    </div>
    <div class="formGroupSwal"> 
      <label for="arrivalDate">Fecha de inicio</label> 
      <input type="date" id="arrivalDate" class="swal2-input" placeholder="Fecha inicio de Reservación">
    </div>
    <div class="formGroupSwal">
      <label for="departureDate">Fecha de fin</label>
      <input type="date" id="departureDate" class="swal2-input" placeholder="Fecha finde  Reservación">
    </div>
    <h3>Datos de cliente</h3>
      <input type="text" id="clientName" class="swal2-input" placeholder="Nombre del cliente">
      <input type="email" id="clientEmail" class="swal2-input" placeholder="Correo del cliente">
    `,
    showCancelButton: true,
    confirmButtonText: "Reservar",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const name = document.getElementById("name").value;
      const arrivalDate = document.getElementById("arrivalDate").value;
      const departureDate = document.getElementById("departureDate").value;
      const clientName = document.getElementById("clientName").value;
      const clientEmail = document.getElementById("clientEmail").value;
      // comprobar que la fecha de salida no sea antes que la de entrada
      if (arrivalDate > departureDate) {
        Swal.showValidationMessage("La fecha de salida no puede ser antes que la de entrada");
        return;
      }
      if ( name === "" ||arrivalDate === "" || departureDate === "" || clientName === "" || clientEmail === "") {
        Swal.showValidationMessage("Todos los campos son requeridos");
        return;
      }
      return {
        name,
        arrivalDate,
        departureDate,
        clientName,
        clientEmail,
      };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const { name, arrivalDate, departureDate, clientName, clientEmail } = result.value;
      console.log({
        user: userData.id,
        property: id,
        name,
        arrivalDate,
        departureDate,
        clientName,
        clientEmail,
      })
      try {
        UserInstanceApi.post("/reservation/create", {
          name,
          arrivalDate,
          departureDate,
          user: userData.id,
          property: id,
        });
      } catch (error) {
        console.error(error);
        Toast.fire({
          icon: "error",
          title: "Error al realizar la reservación",
        });
        return;
      }
      Swal.fire({
        title: "Reservación Realizada",
        html: `
          <h3>Fecha de Reservación:</h3>
          <p>${arrivalDate} hasta ${departureDate}</p>
          <h3>Cliente:</h3>
          <p>${clientName} (${clientEmail})</p>
        `,
        icon: "success",
      });
    }
  });
};

function addDataToMyReservationsTable(array) {
  const tbody = document.getElementById("myReservesTableBody");
  tbody.innerHTML = ""; 
  if (array.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td colspan="6" class="noProperties">No hay reservaciones disponibles</td>
    `;
    tbody.appendChild(row);
    return;
  }

  array.forEach((reservation) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${reservation.property.name}</td> <!-- Columna 1: Nombre de la propiedad -->
      <td>${reservation.property.location.country} ${reservation.property.location.city}</td> <!-- Columna 2: Ubicación -->
      <td>${reservation.property.propertyType}</td> <!-- Columna 3: Tipo de Propiedad -->
      <td>$${reservation.property.nightPrice}</td> <!-- Columna 4: Precio por Noche -->
      <td>${reservation.reservationDate} hasta ${reservation.reservationDays}</td> <!-- Columna 5: Fechas de Reservación -->
      <td> <!-- Columna 6: Acciones -->
        <button onclick="viewDetails('${reservation._id}')">Ver detalles</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}
// mostrar detalles de la reservación
window.Function = function viewDetails(id) {
  const reservation = myReservations.find((reservation) => reservation._id === id);
  const total = calculateTotalReservations(id);
  Swal.fire({
    title: "Detalles de la Reservación",
    html: `
      <h3>Propiedad:</h3>
      <p>${reservation.property.name}</p>
      <h3>Ubicación:</h3>
      <p>${reservation.property.location.country} ${reservation.property.location.city}</p>
      <h3>Tipo de Propiedad:</h3>
      <p>${reservation.property.propertyType}</p>
      <h3>Precio por Noche:</h3>
      <p>$${reservation.property.nightPrice}</p>
      <h3>Fecha de Reservación:</h3>
      <p>${reservation.reservationDate} hasta ${reservation.reservationDays}</p>
      <h3>Total:</h3>
      <p>$${total}</p>
    `,
    icon: "info",
  });
}

function addDataToTable(array) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = ""; 

  if (array.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td colspan="6" class="noProperties">No hay propiedades disponibles</td>
    `;
    tbody.appendChild(row);
    return;
  }

  array.forEach((property) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${property.name}</td> <!-- Columna 1: Nombre -->
      <td>${property.location.country} ${property.location.city}</td> <!-- Columna 2: Ubicación -->
      <td>${property.propertyType}</td> <!-- Columna 3: Tipo de Propiedad -->
      <td>$${property.nightPrice}</td> <!-- Columna 4: Precio por Noche -->
      <td>${property.disponibility ? "Disponible" : "No Disponible"}</td> <!-- Columna 5: Disponibilidad -->
      <td> <!-- Columna 6: Acciones -->
        ${property.disponibility ? `<button onclick="makeReservation('${property._id}')">Reservar</button>` : "No disponible para reservar"}
      </td>
    `;
    tbody.appendChild(row);
  });
}


async function main() {
  properties = await fetchProperties();
  myReservations = await fetchMyReservations();
  addDataToTable(properties);
  addDataToMyReservationsTable(myReservations);
}

main();

document.getElementById("locationFilter").addEventListener("input", filterByLocation);

document.getElementById("propertyTypeFilter").addEventListener("change",filterByProperty);

document.getElementById("priceFilter").addEventListener("click", filterByPrice);

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("userData");
  window.location.href = "../../../index.html";
});