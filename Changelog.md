# Changelog

## Upcoming Changes (Available on `main` docker tag or code in `main` branch)

- feat: Route prefix support. You can run this app at a path prefix by setting the `PKMN_TCG_APP_ROUTE_PREFIX` environment variable
- feat: Import and Export functionality. The format is in JSON and can be viewed if you hit the /followedCards endpoint on your instance.
- feat: Updated cronjobs to use system timezone rather than just EST
- feat: Updated API urls. This will cause 404s likely if you had saved particular other than the homepage

## 1.0.0 - (Oct 19, 2024)

- Initial tagged release
