const crypto = require('crypto');

exports.handler = function (context, event, callback) {
  const {username, password} = event;

  if (!username) {
    return callback(null, {error_code: 503, error: "Nom d'utilisateur absent"});
  }

  if (!password) {
    return callback(null, {error_code: 504, error: "Mot de passe absent"});
  }

  const hash = crypto.createHmac('sha512', context.AUTH_TOKEN);
  hash.update(password);
  const hashed_password = hash.digest('hex');
  console.log("hashed: ", hashed_password);

  if (username === context.USERNAME && hashed_password === context.HASHED_PASSWORD) {
    const client = context.getTwilioClient();
    client.sync.services(context.SYNC_SERVICE_SID)
      .documents
      .create({ttl: context.CONNECTION_TTL_SECONDS})
      .then(document => callback(null, {token: document.sid}))
      .catch(error => callback(null, {error_code: error.code, error: error.message}));
  } else {
    callback(null, {error_code: 403, error: "Nom d'utilisateur ou mot de passe invalide. "});
  }
};
