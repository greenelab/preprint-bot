# Preprint Bot

Twitter bot that regularly tweets out the hottest preprints published to BioRxiv and MedRxiv.

[⭐ SEE THE BOT ⭐](https://twitter.com/PreprintBot)

# How it works

- Written in [Node.js](https://nodejs.org/en/)
- Hosted and run periodically with [GitHub Actions](https://github.com/greenelab/preprint-bot/actions)
- Uses a Twitter developer account ([@PreprintBot](https://twitter.com/PreprintBot)), a project and app under that account ([Preprint Bot](https://developer.twitter.com/en/portal/projects/1359601402025230338/apps)), and keys for the app (`consumer_key`/`consumer_secret`) and the account (`access_token_key`/`access_token_secret`) generated in the [developer portal](https://developer.twitter.com/en/portal/dashboard)
