let connection_token = "";
let connection_checker = null;
let last_sms_sid = "";
let sms_checker = null;

const errorMap = ["Numéro invalide", "Code pays invalide", "Numéro trop court", "Numéro trop long", "Numéro invalide"];

const input = document.querySelector("#phone");
const iti = window.intlTelInput(input, {
  // any initialisation options go here
  initialCountry: "fr",
  utilsScript: "utils.js"
});

$("#phone").keyup(function () {
  $("#phone")[0].setCustomValidity("");
});

$("#send").click(function () {
  const phoneInput = $("#phone");
  const messageInput = $("#messageInput");
  if (!phoneInput[0].reportValidity() || !messageInput[0].reportValidity()) return;
  if (!iti.isValidNumber()) {
    phoneInput[0].setCustomValidity(errorMap[iti.getValidationError()])
    phoneInput[0].reportValidity();
    return
  }
  const destination = iti.getNumber();
  const message = messageInput.val();
  send(destination, message);
});

$("#connect").click(function (e) {
  e.preventDefault();
  const usernameInput = $("#username");
  const passwordInput = $("#password");
  if (!usernameInput[0].reportValidity() || !passwordInput[0].reportValidity()) return;
  const username = usernameInput.val();
  const password = passwordInput.val();
  connect(username, password);

});

$('#staticBackdrop').on('shown.bs.modal', function () {
  $('#username').focus()
});

let modal;

$(document).ready(function () {
  const myModalEl = document.querySelector('#staticBackdrop')
  modal = bootstrap.Modal.getOrCreateInstance(myModalEl)
  modal.show();
});

function connect(username, password) {
  $("#connection-alert").hide();
  fetch('user/connect', {
    method: 'POST',
    body: JSON.stringify({username: username, password: password}), // string or object
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async (response) => {
      if (!response.ok) {
        // make the promise be rejected if we didn't get a 2xx response
        const err = new Error(await response.text());
        err.response = response.text();
        throw err;
      } else {
        return response.json();
      }
    })
    .then((response) => {
      if (response.error) {
        console.log("Connection issue: ", response);
        $("#connection-alert").text("Problème de connection (" + response.error + ")").show();
      } else if (response.token) {
        modal.hide();
        connection_token = response.token;
        $("#username").val("");
        $("#password").val("");
        $("#phone").focus();
        check_connection();
      }
    })
    .catch((reason) => {
      console.log("connection issue: ", reason);
      $("#connection-alert").text("Problème de connection (" + reason + ")").show();
    })
}

function check_connection() {
  if (!connection_token) return;
  fetch('user/check', {
    method: 'POST',
    body: JSON.stringify({token: connection_token}), // string or object
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(async (response) => {
      if (!response.ok) {
        // make the promise be rejected if we didn't get a 2xx response
        const err = new Error(await response.text());
        err.response = response.text();
        throw err;
      } else {
        return response.json();
      }
    })
    .then((response) => {
      if (!response.valid) {
        connection_token = "";
        clearTimeout(connection_checker);
        modal.show();
      } else {
        modal.hide();
        connection_checker = setTimeout(check_connection, 5000);
      }
    })
    .catch((reason) => {
      console.log("check issue: ", reason);
      connection_checker = setTimeout(check_connection, 5000);
    })
}

function send(dest, message) {
  clearTimeout(sms_checker);
  if (!dest || !message) return;
  $("#sms-alert").hide();
  $("#sms-success").text("Statut du dernier SMS : Tentative d'envoi en cours...").show();
  fetch('sms/send', {
    method: 'POST',
    body: JSON.stringify({token: connection_token, dest: dest, message: message}),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async (response) => {
      if (!response.ok) {
        // make the promise be rejected if we didn't get a 2xx response
        const err = new Error(await response.text());
        err.response = response.text();
        throw err;
      } else {
        return response.json();
      }
    })
    .then((response) => {
      if (!response.error) {
        last_sms_sid = response.sid;
        $("#phone").val("");
        $("#sms-alert").hide();
        $("#sms-success").text("Statut du dernier SMS : En cours d'envoi...").show();
        check_sms();
      } else {
        console.log("send issue: ", response);
        $("#sms-success").hide();
        $("#sms-alert").text("Erreur d'envoi: " + response.error).show();
      }

    })
    .catch((error) => {
      console.log("send issue: ", error);
      $("#sms-success").hide();
      $("#sms-alert").text("Erreur d'envoi: " + error.message).show();
    })
}

function check_sms() {
  if (!last_sms_sid) return;
  fetch('sms/check', {
    method: 'POST',
    body: JSON.stringify({token: connection_token, sid: last_sms_sid}), // string or object
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(async (response) => {
      if (!response.ok) {
        // make the promise be rejected if we didn't get a 2xx response
        const err = new Error(await response.text());
        err.response = response.text();
        throw err;
      } else {
        return response.json();
      }
    })
    .then((response) => {
      if (response.sms) {
        const date = new Date(Date.parse(response.sms.dateCreated));
        const sms_success = $("#sms-success");
        const sms_alert = $("#sms-alert");
        if(response.sms.status === "undelivered" || response.sms.status === "failed") {
          sms_success.hide();
          sms_alert.text("Statut du dernier SMS : " + response.sms.status + " (du " + date.toLocaleString() + ")").show();
        } else {
          sms_alert.hide();
          sms_success.text("Statut du dernier SMS : " + response.sms.status + " (du " + date.toLocaleString() + ")").show();
        }
        if (response.sms.status !== "delivered" && response.sms.status !== "undelivered" && response.sms.status !== "failed") {
          connection_checker = setTimeout(check_sms, 1000);
        }

      } else if (response.error) {
        console.log("check sms issue: ", response);
        $("#sms-success").hide();
        $("#sms-alert").text("Erreur : " + response.error + " (" + response.error_code + ")").show();
        connection_checker = setTimeout(check_sms, 5000);
      }
    })
    .catch((reason) => {
      console.log("check sms issue: ", reason);
      connection_checker = setTimeout(check_sms, 5000);
    })
}
