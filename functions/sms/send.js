const axios = require('axios').default;

exports.handler = function(context, event, callback) {
  const {token, dest, message} = event;

  if(!token) {
    callback(null, {error_code: 403, error: "Veuillez vous connecter"});
  }

  if(!dest) {
    callback(null, {error_code: 503, error: "Destinataire manquant"});
  }

  if(!message) {
    callback(null, {error_code: 504, error: "Message manquant"});
  }

  const client = context.getTwilioClient();
  client.sync.services(context.SYNC_SERVICE_SID)
    .documents(token)
    .fetch()
    .then(document => {
      client.messages.create({
          messagingServiceSid: context.MESSAGING_SERVICE_SID,
          to: dest,
          body: message
        })
        .then((sms) => callback(null, {sid: sms.sid}))
        .catch((error => callback(null, {error_code: error.code, error: error.message})));
    })
    .catch(reason => callback(null, {error_code: 403, error: "Veuillez vous connecter"}));
};
