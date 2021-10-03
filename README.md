# One Shot PlantUML

Source code of [one-shot-plantuml](https://one-shot-puml.herokuapp.com/). Inspired by [real-world-plantuml](https://github.com/yfuruyama/real-world-plantuml), the insane developer (it's me) wants to build a tool for PlantUML believers to get PlantUML masterpiece (or shit) newly created on Github.

Thanks to:

- [headless-chrome](https://github.com/timleland/headless-chrome)
- [puppeteer-heroku-buildpack](https://github.com/jontewks/puppeteer-heroku-buildpack)
- [real-world-plantuml](https://github.com/yfuruyama/real-world-plantuml)

### Deploy

- clone the repo `git clone git@github.com:LangInteger/one-shot-plantuml.git`
- walk into the directory `cd one-shot-plantuml`
- make sure [heroku cli](https://devcenter.heroku.com/articles/heroku-cli) is installed and logined
- create your app `heroku create your-app-name`
- add buildpacks as infrastructure
  - node.js as application entry `heroku buildpacks:set heroku/nodejs`
  - puppeteer-heroku-buildpack add extra dependencies for puppeteer `heroku buildpacks:add --index 1 https://github.com/jontewks/puppeteer-heroku-buildpack`
- deploy to remote `git push heroku main`
- add env variables `GITHUB_USERNAME` and `GITHUB_PASSWORD` on your application settings dashboard
- check application logs `heroku logs --tail`
- make some changes and deploy again
  - `git add .`
  - `git commit -m "xxx"`
  - `git push heroku main`

For local test, use `heroku local web`.

### Architecture & Usage

![Architecture, if cannot see, please check your network](https://raw.githubusercontent.com/LangInteger/one-shot-plantuml/main/docs/one-shot-plantuml-architecture.png)

![Demo1, if cannot see, please check your network](https://raw.githubusercontent.com/LangInteger/one-shot-plantuml/main/docs/osp-demo1.gif)

![Demo2, if cannot see, please check your network](https://raw.githubusercontent.com/LangInteger/one-shot-plantuml/main/docs/osp-demo2.gif)

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
