const axios = require('axios').default;

exports.handler = function(context, event, callback) {
  const {token, sid} = event;

  if(!token) {
    callback(null, {error_code: 403, error: "Veuillez vous connecter"});
  }

  if(!sid) {
    callback(null, {error_code: 503, error: "sid manquant"});
  }

  const client = context.getTwilioClient();
  client.sync.services(context.SYNC_SERVICE_SID)
    .documents(token)
    .fetch()
    .then(document => {
      client.messages(sid).fetch()
        .then((sms) => callback(null, {sms}))
        .catch(error => callback(null, {error_code: error.code, error: error.message}));
    })
    .catch(reason => callback(null, {error_code: 403, error: "Veuillez vous connecter"}));
};
