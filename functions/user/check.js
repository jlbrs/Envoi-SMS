exports.handler = function(context, event, callback) {
  const {token} = event;

  if(!token) {
    callback(null, {valid: false});
  }

  const client = context.getTwilioClient();
  client.sync.services(context.SYNC_SERVICE_SID)
    .documents(token)
    .fetch()
    .then(document => callback(null, {valid: true}))
    .catch(reason => callback(null, {valid: false}));

};
