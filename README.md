# Envoi de SMS 

Cet outil est destiné à envoyer des SMS unitairement vers n'importe quel numéro à l'international, en utilisant votre compte Twilio. 

L'envoi est fait en utilisant un Messaging Service. 

## Déploiement

1. Copiez le fichier `.env.sample` en `.env`

```shell
copy ./.env.sample .env
```

2. Editez le nouveau fichier `.env` et fournissez les variables nécessaires : 

* `ACCOUNT_SID` et `AUTH_TOKEN` : Le "SID" et le "Auth Token" de votre compte Twilio, il se trouvent sur la page d'accueil de votre compte (https://console.twilio.com)
* `SYNC_SERVICE_SID`: Pour utiliser cet outil vous devez créer un service "Twilio Sync" sur votre console (rubrique "Sync > Services"). Vous pouvez laisser la configuration par défaut. Copiez ensuite le "SID" du service créé. 
* `USERNAME` et `HASHED_PASSWORD` : les noms d'utilisateurs et mot de passe pour utiliser votre application. Le mot de passe doit être encrypté en SHA512 avec votre "Auth Token" comme sel. 
* `CONNECTION_TTL_SECONDS` : La durée (en secondes) de validité de la connexion. 
* `MESSAGING_SERVICE_SID` : Pour utiliser cet outil vous devez créer un "Messaging Service" sur votre console (rubrique "Messaging > Services"). N'oubliez pas d'ajouter les expéditeurs dans la "Sender Pool". Plus d'informations [ici](https://www.twilio.com/docs/sms/send-messages#messaging-services).

3. Utilisez [Twilio CLI](https://www.twilio.com/docs/twilio-cli/quickstart) et le [Serverless toolkit](https://www.twilio.com/docs/labs/serverless-toolkit) pour déployer l'outil sur votre compte Twilio :

```shell
twilio serverless:deploy --production
```

4. Repérez `index.html` dans le retour de la commande précédente (dans la partie "Assets"), c'est l'adresse de votre nouvel outil!

```
https://envoi-sms-XXXX.twil.io/index.html
```

5. Rendez-vous à l'url, connectez-vous en utilisant les noms d'utilisateurs et mot de passe définis plus haut, et commencez à envoyer vos SMS !
