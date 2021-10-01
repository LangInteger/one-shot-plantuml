# One Shot PlantUML

Source code of [one-shot-plantuml](https://one-shot-puml.herokuapp.com/). Inspired by [real-world-plantuml](https://github.com/yfuruyama/real-world-plantuml), the insane developer (it's me) wants to build a tool for PlantUML believers to get PlantUML masterpiece (or shit) newly created on Github.

Thanks to:

- [headless-chrome](https://github.com/timleland/headless-chrome)
- [puppeteer-heroku-buildpack](https://github.com/jontewks/puppeteer-heroku-buildpack)
- [real-world-plantuml](https://github.com/yfuruyama/real-world-plantuml)

### Troubleshooting

#### 1 Github API Support is Limited

This project use [puppeteer](https://github.com/puppeteer/puppeteer) to imitate operations on browsers and thus get `puml` files from Github.

The most convinient way to contact with contents on github is using the Github API. But for some reason, there is no open api to get newly created files by their extensions( the usage of `/search/code` without specifying a user, an organisation or a repository is impossible).

This [reddit post](https://www.reddit.com/r/github/comments/dr19uu/finding_all_files_with_a_certain_extension/) make me think using ghaechive maybe another proper way, but havn't give it a try yet.

#### 2 Github Verification Code Feature is Noisy

Github released the [Device Verification feature](https://github.community/t/new-security-feature-device-verification/10216) and enabled it for all accounts that not have two-factor authentication (2FA) enabled. So even with puppeteer to imitate login, we must interact with the verification process.

Many have posted article that suggests [Disable / Remove Device Verification](https://github.community/t/disable-remove-email-device-verification-prompt-on-login-not-the-2fa/2333), but not got accepted yet and it seems that this feature will continue to work for a thousand years.

#### 3 Heroku Dynos Like to Hibernate

Refer to [Heroku Doc](https://devcenter.heroku.com/articles/free-dyno-hours):

- If an app has a free web dyno, and that dyno receives no web traffic in a 30-minute period, it will sleep

When sleep, the main process and browser process will both be terminated. Since Github relies on cookies to identify devices, it will ask for device verification the next time login recoverd from sleep, which is a disaster.

Luckily there are some ways to stop dynos from hibernate easily, according to this [SO thread](https://stackoverflow.com/questions/5480337/easy-way-to-prevent-heroku-idling).
